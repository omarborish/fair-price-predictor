"""
Fair Price Used Car Predictor - FastAI Tabular Training
========================================================
Trains a TabularLearner with TabularPandas. Exports export.pkl for inference.
Uses shared feature_engineering (add_engineered_features, ensure_region).
Run from repo root: python training/train_fastai.py

Comparison vs legacy (HistGB blend): similar MAE (~$3.2k), FastAI often better
within ±10%/±15%; RMSE can be higher (a few large errors). Validation MAE/rmse
bouncing by epoch is normal with fit_one_cycle (LR schedule); we save the best
epoch by valid_loss (SaveModelCallback) so the exported model is not the last.
"""
import os
import sys
import json
import warnings
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# Add parent and server for imports
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from server.feature_engineering import add_engineered_features, ensure_region, CURRENT_YEAR

# -----------------------
# Config
# -----------------------
DATA_PATH = REPO_ROOT / "vehicles.csv"
OUTPUT_DIR = REPO_ROOT / "server" / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET_COL = "price"
MIN_PRICE = 500
MAX_PRICE = 250_000
RANDOM_SEED = 42
VALID_PCT = 0.15
TEST_PCT = 0.25

# Categorical and continuous feature names (after feature engineering)
CAT_NAMES = [
    "manufacturer",
    "model",
    "condition",
    "fuel",
    "transmission",
    "drive",
    "type",
    "paint_color",
    "state",
    "region",
    "manufacturer_model",
    "region_x_make",
    "cylinders",
    "title_status",
]
CONT_NAMES = [
    "year",
    "odometer",
    "car_age",
    "miles_per_year",
    "log_odometer",
    "age_x_odometer",
    "age_x_miles_per_year",
    "age_div_odometer",
]
# Optional: add if present in dataset
CONT_OPTIONAL = ["county", "lat", "long"]
Y_NAME = "log_price"  # train on log1p(price) for stability


def sanitize_prices(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """Clean price and filter extremes."""
    df = df.copy()
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
    df = df.dropna(subset=[target_col])
    df = df[(df[target_col] >= MIN_PRICE) & (df[target_col] <= MAX_PRICE)]
    return df


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Drop unused cols, ensure region, add engineered features, align columns."""
    drop = [c for c in ["id", "vin", "url", "posting_date", "removed", "image_url"] if c in df.columns]
    if drop:
        df = df.drop(columns=drop)
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    # Target
    df[Y_NAME] = np.log1p(df[TARGET_COL])
    return df


def get_final_cat_cont(df: pd.DataFrame):
    """Resolve cat/cont lists to columns actually present. Exclude CONT_OPTIONAL (county, lat, long) to avoid NaN/inf from geo data."""
    cat = [c for c in CAT_NAMES if c in df.columns]
    cont = [c for c in CONT_NAMES if c in df.columns]
    # Optional geo columns often cause NaN loss; omit from training for stability
    # for c in CONT_OPTIONAL:
    #     if c in df.columns and c not in cont:
    #         cont.append(c)
    return cat, cont


def main():
    print("\n" + "=" * 60)
    print("FAIR PRICE - FastAI Tabular Training")
    print("=" * 60)

    if not DATA_PATH.exists():
        print(f"[ERROR] Data not found: {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, low_memory=False)
    print(f"Loaded {len(df):,} rows from {DATA_PATH}")

    df = sanitize_prices(df, TARGET_COL)
    print(f"After price sanitization: {len(df):,} rows")

    df = prepare_dataframe(df)
    print(f"After feature engineering: {len(df):,} rows")

    cat_names, cont_names = get_final_cat_cont(df)
    print(f"Cat features ({len(cat_names)}): {cat_names}")
    print(f"Cont features ({len(cont_names)}): {cont_names}")

    # Align: only keep cat + cont + y
    feature_cols = cat_names + cont_names
    if Y_NAME not in df.columns:
        df[Y_NAME] = np.log1p(df[TARGET_COL])
    df = df[feature_cols + [Y_NAME]].copy()

    # Fill missing in cont with median (FastAI FillMissing will also handle)
    for c in cont_names:
        if df[c].isna().any():
            df[c] = df[c].fillna(df[c].median())

    # Train/valid/test split
    n = len(df)
    np.random.seed(RANDOM_SEED)
    idx = np.random.permutation(n)
    n_test = int(n * TEST_PCT)
    n_valid = int((n - n_test) * VALID_PCT)
    n_train = n - n_test - n_valid
    test_idx = idx[:n_test]
    valid_idx = idx[n_test : n_test + n_valid]
    train_idx = idx[n_test + n_valid :]

    splits = (list(train_idx), list(valid_idx))
    df_train = df.iloc[train_idx]
    df_valid = df.iloc[valid_idx]
    df_test = df.iloc[test_idx]
    print(f"Train: {len(df_train):,}  Valid: {len(df_valid):,}  Test: {len(df_test):,}")

    # FastAI (optional dep; type checker may not have it)
    try:
        from fastai.tabular.all import (  # type: ignore[reportMissingImports]
            TabularPandas,
            tabular_learner,
            tabular_config,
            Categorify,
            FillMissing,
            Normalize,
        )
        from fastai.metrics import mae, rmse  # type: ignore[reportMissingImports]
    except ImportError as e:
        print(f"[ERROR] FastAI not installed: {e}")
        print("Install with: pip install fastai")
        sys.exit(1)

    procs = [FillMissing, Categorify, Normalize]
    to = TabularPandas(
        df,
        procs=procs,
        cat_names=cat_names,
        cont_names=cont_names,
        y_names=Y_NAME,
        splits=splits,
    )
    dls = to.dataloaders(bs=512)
    learn = tabular_learner(
        dls,
        layers=[400, 200],
        config=tabular_config(ps=0.3),
        metrics=[mae, rmse],
        wd=1e-2,
    )
    from fastai.callback.tracker import SaveModelCallback, EarlyStoppingCallback  # type: ignore[reportMissingImports]
    learn.path = OUTPUT_DIR
    cbs = [
        SaveModelCallback(fname="best_tabular", monitor="valid_loss"),
        EarlyStoppingCallback(monitor="valid_loss", patience=3),
    ]
    learn.fit_one_cycle(30, lr_max=3e-3, cbs=cbs)

    # Export (includes procs + model; inference uses this only)
    export_path = OUTPUT_DIR / "export.pkl"
    learn.export(export_path)
    print(f"[OK] Exported learner: {export_path}")

    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    log_min = np.log1p(MIN_PRICE)
    log_max = np.log1p(MAX_PRICE)

    def _compute_metrics(y_true: np.ndarray, y_pred_log: np.ndarray, label: str) -> dict:
        """Compute clipped metrics + R2. y_pred_log is in log space."""
        preds_clipped = np.clip(y_pred_log, log_min, log_max)
        y_pred = np.expm1(preds_clipped)
        valid_mask = np.isfinite(y_true) & np.isfinite(y_pred)
        if valid_mask.sum() == 0:
            return {"mae": None, "rmse": None, "mape": None, "r2": None, "within_10pct": 0.0, "within_15pct": 0.0}
        y_t, y_p = y_true[valid_mask], y_pred[valid_mask]
        return {
            "mae": float(mean_absolute_error(y_t, y_p)),
            "rmse": float(np.sqrt(mean_squared_error(y_t, y_p))),
            "mape": float(np.mean(np.abs((y_t - y_p) / (y_t + 1e-9))) * 100),
            "r2": float(r2_score(y_t, y_p)),
            "within_10pct": float(np.mean(np.abs(y_t - y_p) <= 0.10 * y_t) * 100),
            "within_15pct": float(np.mean(np.abs(y_t - y_p) <= 0.15 * y_t) * 100),
        }

    # Validation metrics
    valid_dl = dls.valid
    preds_val, _ = learn.get_preds(dl=valid_dl)
    preds_val = preds_val.numpy().reshape(-1)
    y_true_val = np.expm1(df_valid[Y_NAME].values)
    n_clipped_val = np.sum((preds_val != np.clip(preds_val, log_min, log_max)) & np.isfinite(preds_val))
    if n_clipped_val > 0:
        print(f"[INFO] Clipped {n_clipped_val} validation predictions to [{MIN_PRICE}, {MAX_PRICE}] for metrics.")
    validation_metrics = _compute_metrics(y_true_val, preds_val, "validation")

    # Test metrics (if test_dl available)
    test_metrics = None
    try:
        test_df = df_test[cat_names + cont_names + [Y_NAME]].copy()
        test_dl = dls.test_dl(test_df)
        preds_test, _ = learn.get_preds(dl=test_dl)
        preds_test = preds_test.numpy().reshape(-1)
        y_true_test = np.expm1(df_test[Y_NAME].values)
        test_metrics = _compute_metrics(y_true_test, preds_test, "test")
    except Exception as e:
        print(f"[WARN] Test set metrics skipped: {e}")

    def _f(x):
        return float(x) if x is not None and np.isfinite(x) else None

    metrics = {
        "model_type": "fastai_tabular",
        "validation": {k: (_f(v) if k in ("mae", "rmse", "mape", "r2") else v) for k, v in validation_metrics.items()},
        "test": {k: (_f(v) if k in ("mae", "rmse", "mape", "r2") else v) for k, v in (test_metrics or {}).items()} if test_metrics else None,
        "training_samples": int(len(df_train)),
        "validation_samples": int(len(df_valid)),
        "test_samples": int(len(df_test)),
        "cat_names": cat_names,
        "cont_names": cont_names,
        "y_name": Y_NAME,
        "split_strategy": "random",
        "trained_at": datetime.now().isoformat(),
    }
    if metrics["test"] is None:
        del metrics["test"]

    metrics_path = OUTPUT_DIR / "training_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Saved metrics: {metrics_path}")

    v = metrics["validation"]
    print("\n[METRICS] Validation:")
    print(f"  MAE:  ${v['mae']:,.0f}" if v.get('mae') is not None else "  MAE:  N/A")
    print(f"  RMSE: ${v['rmse']:,.0f}" if v.get('rmse') is not None else "  RMSE: N/A")
    print(f"  MAPE: {v['mape']:.1f}%" if v.get('mape') is not None else "  MAPE: N/A")
    print(f"  R2:   {v['r2']:.4f}" if v.get('r2') is not None else "  R2:   N/A")
    print(f"  Within ±10%: {v['within_10pct']:.1f}%")
    print(f"  Within ±15%: {v['within_15pct']:.1f}%")
    if metrics.get("test"):
        t = metrics["test"]
        print("\n[METRICS] Test:")
        print(f"  MAE:  ${t['mae']:,.0f}" if t.get('mae') is not None else "  MAE:  N/A")
        print(f"  RMSE: ${t['rmse']:,.0f}" if t.get('rmse') is not None else "  RMSE: N/A")
        print(f"  R2:   {t.get('r2'):.4f}" if t.get('r2') is not None else "  R2:   N/A")
    print("\n[COMPARE] Legacy baseline: MAE ~$3,269, RMSE ~$5,165, within ±10% ~39%, ±15% ~52%.")

    # Config for inference (feature list)
    config = {
        "model_type": "fastai_tabular",
        "export_path": "export.pkl",
        "cat_names": cat_names,
        "cont_names": cont_names,
        "y_name": Y_NAME,
        "target_column": TARGET_COL,
        "min_price": MIN_PRICE,
        "max_price": MAX_PRICE,
        "trained_at": metrics["trained_at"],
    }
    config_path = OUTPUT_DIR / "model_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"[OK] Saved config: {config_path}")

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
