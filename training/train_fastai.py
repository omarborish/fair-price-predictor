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
import time
import warnings
import hashlib
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# Add parent and server for imports
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from server.feature_engineering import (
    add_engineered_features,
    ensure_region,
    CURRENT_YEAR,
    add_time_features,
    add_buckets,
    add_more_cont_features,
)

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

# Experimentation options (can be overridden via env vars)
LOSS_TYPE = os.getenv("LOSS_TYPE", "mse")  # "mse" | "huber" | "smoothl1"
SPLIT_STRATEGY = os.getenv("SPLIT_STRATEGY", "random")  # "random" | "group"
GROUP_KEY = os.getenv("GROUP_KEY", "manufacturer_model")  # manufacturer_model | region_x_make
HUBER_DELTA = float(os.getenv("HUBER_DELTA", "0.1"))  # Huber delta
SMOOTHL1_BETA = float(os.getenv("SMOOTHL1_BETA", "1.0"))  # SmoothL1 beta
ENSEMBLE_SIZE = int(os.getenv("ENSEMBLE_SIZE", "1"))  # 1 = single model, >1 = ensemble
# Architecture tuning: "400,200" (default) or "512,256"
_LAYERS_ENV = os.getenv("LAYERS", "400,200")
LAYERS = [int(x.strip()) for x in _LAYERS_ENV.split(",") if x.strip()]
if not LAYERS:
    LAYERS = [400, 200]
WD = float(os.getenv("WD", "0.01"))  # weight decay: 0.001 or 0.01

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
    "car_age_bucket",
    "posting_month",
    "posting_year",
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
    "log_miles_per_year",
    "age_sq",
    "dealer_score",  # P(dealer) from weak-label classifier; 0 if classifier missing
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
    """Drop unused cols, ensure region, add engineered + time + bucket features, then drop posting_date."""
    drop = [c for c in ["id", "vin", "url", "removed", "image_url"] if c in df.columns]
    if drop:
        df = df.drop(columns=drop)
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    df = add_time_features(df, posting_date_col="posting_date")
    df = add_buckets(df)
    df = add_more_cont_features(df)
    if "posting_date" in df.columns:
        df = df.drop(columns=["posting_date"])
    # dealer_score from saved classifier (optional; run train_dealer_classifier.py first)
    dealer_cbm = OUTPUT_DIR / "dealer_clf.cbm"
    dealer_joblib = OUTPUT_DIR / "dealer_clf.joblib"
    cfg_path = OUTPUT_DIR / "dealer_clf_config.json"
    cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
    feat_cols = cfg.get("feature_cols", [c for c in CAT_NAMES + CONT_NAMES if c in df.columns and c != "dealer_score"])
    if dealer_cbm.exists():
        try:
            from catboost import CatBoostClassifier
            clf = CatBoostClassifier()
            clf.load_model(str(dealer_cbm))
            Xd = df.reindex(columns=feat_cols, fill_value=0)
            for c in cfg.get("cat_cols", []):
                if c in Xd.columns and Xd[c].dtype != object:
                    Xd[c] = Xd[c].astype(str).replace("0", "unknown")
            df["dealer_score"] = clf.predict_proba(Xd)[:, 1]
        except Exception as e:
            print(f"[WARN] Dealer classifier load failed, using dealer_score=0: {e}")
            df["dealer_score"] = 0.0
    elif dealer_joblib.exists():
        try:
            import joblib
            data = joblib.load(dealer_joblib)
            transformer, clf = data.get("transformer"), data.get("clf")
            if transformer is not None and clf is not None:
                Xd = df.reindex(columns=feat_cols, fill_value=0).copy()
                for c in cfg.get("cat_cols", []):
                    if c in Xd.columns:
                        Xd[c] = Xd[c].fillna("unknown").astype(str).replace("", "unknown")
                for c in cfg.get("cont_cols", []):
                    if c in Xd.columns:
                        Xd[c] = pd.to_numeric(Xd[c], errors="coerce").fillna(0)
                Xt = transformer.transform(Xd)
                df["dealer_score"] = clf.predict_proba(Xt)[:, 1]
            else:
                df["dealer_score"] = 0.0
        except Exception as e:
            print(f"[WARN] Dealer .joblib load failed, using dealer_score=0: {e}")
            df["dealer_score"] = 0.0
    else:
        df["dealer_score"] = 0.0
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


def train_single_model(df: pd.DataFrame, seed: int, export_suffix: str = "", run_id: str = None, data_fingerprint: str = None) -> tuple:
    """
    Train a single FastAI model with given seed.
    Returns: (learn, df_train, df_valid, df_test, cat_names, cont_names, splits, split_strategy_actual, dls)
    """
    np.random.seed(seed)
    
    cat_names, cont_names = get_final_cat_cont(df)
    feature_cols = cat_names + cont_names
    if Y_NAME not in df.columns:
        df[Y_NAME] = np.log1p(df[TARGET_COL])
    df_work = df[feature_cols + [Y_NAME]].copy()

    n = len(df_work)
    
    if SPLIT_STRATEGY == "group" and GROUP_KEY in df_work.columns:
        from sklearn.model_selection import GroupShuffleSplit
        groups = df_work[GROUP_KEY].astype(str).fillna("unknown_group").values
        gss = GroupShuffleSplit(n_splits=1, test_size=TEST_PCT, random_state=seed)
        train_val_idx, test_idx = next(gss.split(df_work, groups=groups))
        df_trainval = df_work.iloc[train_val_idx]
        groups_tv = df_trainval[GROUP_KEY].astype(str).fillna("unknown_group").values
        gss2 = GroupShuffleSplit(n_splits=1, test_size=VALID_PCT / (1 - TEST_PCT), random_state=seed)
        train_idx_rel, valid_idx_rel = next(gss2.split(df_trainval, groups=groups_tv))
        train_idx = train_val_idx[train_idx_rel]
        valid_idx = train_val_idx[valid_idx_rel]
        split_strategy_actual = "group"
        print(f"[SPLIT] Group-based split by {GROUP_KEY} (seed={seed})")
    else:
        # Random split (default)
        idx = np.random.permutation(n)
        n_test = int(n * TEST_PCT)
        n_valid = int((n - n_test) * VALID_PCT)
        n_train = n - n_test - n_valid
        test_idx = idx[:n_test]
        valid_idx = idx[n_test : n_test + n_valid]
        train_idx = idx[n_test + n_valid :]
        split_strategy_actual = "random"
        print(f"[SPLIT] Random split (seed={seed})")

    splits = (list(train_idx), list(valid_idx))
    df_train = df_work.iloc[train_idx]
    df_valid = df_work.iloc[valid_idx]
    df_test = df_work.iloc[test_idx]
    print(f"Train: {len(df_train):,}  Valid: {len(df_valid):,}  Test: {len(df_test):,}")

    # Save split indices for CatBoost / conformal to reuse same splits
    split_info = {
        "train_idx": [int(i) for i in train_idx],
        "valid_idx": [int(i) for i in valid_idx],
        "test_idx": [int(i) for i in test_idx],
        "split_strategy": split_strategy_actual,
        "group_key": GROUP_KEY if split_strategy_actual == "group" else None,
        "seed": seed,
    }
    if run_id is not None:
        split_info["run_id"] = run_id
    if data_fingerprint is not None:
        split_info["data_fingerprint"] = data_fingerprint
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_DIR / "split_indices.json", "w") as f:
        json.dump(split_info, f, indent=2)

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
        df_work,
        procs=procs,
        cat_names=cat_names,
        cont_names=cont_names,
        y_names=Y_NAME,
        splits=splits,
    )
    dls = to.dataloaders(bs=512)
    
    # Configure loss function
    import torch.nn as nn
    loss_func = None
    if LOSS_TYPE == "huber":
        loss_func = nn.HuberLoss(delta=HUBER_DELTA)
        print(f"[LOSS] Using HuberLoss(delta={HUBER_DELTA})")
    elif LOSS_TYPE == "smoothl1":
        loss_func = nn.SmoothL1Loss(beta=SMOOTHL1_BETA)
        print(f"[LOSS] Using SmoothL1Loss(beta={SMOOTHL1_BETA})")
    else:
        print("[LOSS] Using MSE loss")
    
    print(f"[CONFIG] layers={LAYERS}, wd={WD}")
    learn = tabular_learner(
        dls,
        layers=LAYERS,
        config=tabular_config(ps=0.3),
        metrics=[mae, rmse],
        wd=WD,
        loss_func=loss_func,
    )
    from fastai.callback.tracker import SaveModelCallback, EarlyStoppingCallback  # type: ignore[reportMissingImports]
    learn.path = OUTPUT_DIR
    cbs = [
        SaveModelCallback(fname="best_tabular", monitor="valid_loss"),
        EarlyStoppingCallback(monitor="valid_loss", patience=3),
    ]
    learn.fit_one_cycle(30, lr_max=3e-3, cbs=cbs)

    # Export (includes procs + model; inference uses this only)
    if export_suffix:
        export_path = OUTPUT_DIR / f"export_seed{seed}.pkl"
    else:
        export_path = OUTPUT_DIR / "export.pkl"
    learn.export(export_path)
    print(f"[OK] Exported learner: {export_path}")
    
    return learn, df_train, df_valid, df_test, cat_names, cont_names, splits, split_strategy_actual, dls


def compute_metrics(learn, df_valid, df_test, cat_names, cont_names, dls) -> tuple:
    """Compute validation and test metrics. Returns (validation_metrics, test_metrics)."""
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    
    log_min = np.log1p(MIN_PRICE)
    log_max = np.log1p(MAX_PRICE)

    def _compute_metrics(y_true: np.ndarray, y_pred_log: np.ndarray, label: str) -> dict:
        """Compute clipped metrics + R2 + percentile errors + unclipped_rmse. y_pred_log is in log space."""
        preds_clipped = np.clip(y_pred_log, log_min, log_max)
        y_pred = np.expm1(preds_clipped)
        y_pred_unclipped = np.expm1(y_pred_log)
        valid_mask = np.isfinite(y_true) & np.isfinite(y_pred)
        if valid_mask.sum() == 0:
            return {
                "mae": None, "rmse": None, "unclipped_rmse": None, "mape": None, "r2": None,
                "within_10pct": 0.0, "within_15pct": 0.0,
                "p95_abs_error": None, "p99_abs_error": None,
                "p95_error": None, "p99_error": None,
            }
        y_t, y_p = y_true[valid_mask], y_pred[valid_mask]
        y_p_raw = y_pred_unclipped[valid_mask]
        abs_errors = np.abs(y_t - y_p)
        unclipped_rmse = float(np.sqrt(mean_squared_error(y_t, np.where(np.isfinite(y_p_raw), y_p_raw, y_p))))
        return {
            "mae": float(mean_absolute_error(y_t, y_p)),
            "rmse": float(np.sqrt(mean_squared_error(y_t, y_p))),
            "unclipped_rmse": unclipped_rmse,
            "mape": float(np.mean(np.abs((y_t - y_p) / (y_t + 1e-9))) * 100),
            "r2": float(r2_score(y_t, y_p)),
            "within_10pct": float(np.mean(np.abs(y_t - y_p) <= 0.10 * y_t) * 100),
            "within_15pct": float(np.mean(np.abs(y_t - y_p) <= 0.15 * y_t) * 100),
            "p95_abs_error": float(np.percentile(abs_errors, 95)),
            "p99_abs_error": float(np.percentile(abs_errors, 99)),
            "p95_error": float(np.percentile(abs_errors, 95)),
            "p99_error": float(np.percentile(abs_errors, 99)),
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
    
    return validation_metrics, test_metrics


def _get_hardware_info() -> str:
    """Return a short hardware description for reproducibility."""
    try:
        import platform
        import multiprocessing
        return f"{platform.processor() or 'CPU'} cores={multiprocessing.cpu_count()}"
    except Exception:
        return "unknown"


def main():
    t0 = time.time()
    print("\n" + "=" * 60)
    print("FAIR PRICE - FastAI Tabular Training")
    print("=" * 60)
    print(f"Configuration: LOSS={LOSS_TYPE}, ENSEMBLE_SIZE={ENSEMBLE_SIZE}, SPLIT={SPLIT_STRATEGY}, GROUP_KEY={GROUP_KEY}")

    if not DATA_PATH.exists():
        print(f"[ERROR] Data not found: {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, low_memory=False)
    print(f"Loaded {len(df):,} rows from {DATA_PATH}")

    df = sanitize_prices(df, TARGET_COL)
    print(f"After price sanitization: {len(df):,} rows")

    df = prepare_dataframe(df)
    print(f"After feature engineering: {len(df):,} rows")

    # Run ID and data fingerprint for reproducible evaluation (evaluate_blend.py checks these)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    try:
        st = DATA_PATH.stat()
        data_fingerprint = f"{st.st_size}_{st.st_mtime}"
    except Exception:
        data_fingerprint = "unknown"

    # Determine seeds for ensemble
    if ENSEMBLE_SIZE > 1:
        seeds = [RANDOM_SEED + i * 10 for i in range(ENSEMBLE_SIZE)]
        print(f"\n[ENSEMBLE] Training {ENSEMBLE_SIZE} models with seeds: {seeds}")
    else:
        seeds = [RANDOM_SEED]

    # Train models
    learners = []
    all_validation_metrics = []
    all_test_metrics = []
    final_cat_names = None
    final_cont_names = None
    final_split_strategy = None
    df_train_final = None
    df_valid_final = None
    df_test_final = None
    
    for i, seed in enumerate(seeds):
        print(f"\n{'='*60}")
        print(f"Training model {i+1}/{len(seeds)} (seed={seed})")
        print(f"{'='*60}")
        
        learn, df_train, df_valid, df_test, cat_names_model, cont_names_model, splits, split_strategy_actual, dls = train_single_model(
            df, seed, export_suffix=f"_seed{seed}" if ENSEMBLE_SIZE > 1 else "", run_id=run_id, data_fingerprint=data_fingerprint
        )
        
        # Compute metrics
        val_metrics, test_metrics = compute_metrics(learn, df_valid, df_test, cat_names_model, cont_names_model, dls)
        all_validation_metrics.append(val_metrics)
        if test_metrics:
            all_test_metrics.append(test_metrics)
        
        learners.append(learn)
        if final_cat_names is None:
            final_cat_names = cat_names_model
            final_cont_names = cont_names_model
            final_split_strategy = split_strategy_actual
            df_train_final = df_train
            df_valid_final = df_valid
            df_test_final = df_test
    
    # Aggregate metrics (for ensemble, average; for single, use directly)
    def _f(x):
        return float(x) if x is not None and np.isfinite(x) else None
    
    if ENSEMBLE_SIZE > 1:
        # Average metrics across ensemble
        def avg_metric(key):
            vals = [m.get(key) for m in all_validation_metrics if m.get(key) is not None]
            return np.mean(vals) if vals else None
        
        numeric_keys = ("mae", "rmse", "unclipped_rmse", "mape", "r2", "p95_error", "p99_error", "p95_abs_error", "p99_abs_error")
        validation_metrics = {
            k: _f(avg_metric(k)) if k in numeric_keys else avg_metric(k)
            for k in all_validation_metrics[0].keys()
        }
        if all_test_metrics:
            test_metrics = {
                k: _f(avg_metric(k)) if k in numeric_keys else avg_metric(k)
                for k in all_test_metrics[0].keys()
            }
        else:
            test_metrics = None
    else:
        numeric_keys = ("mae", "rmse", "unclipped_rmse", "mape", "r2", "p95_error", "p99_error", "p95_abs_error", "p99_abs_error")
        numeric_keys_s = ("mae", "rmse", "unclipped_rmse", "mape", "r2", "p95_error", "p99_error", "p95_abs_error", "p99_abs_error")
        validation_metrics = {k: (_f(v) if k in numeric_keys_s else v) for k, v in all_validation_metrics[0].items()}
        test_metrics = {k: (_f(v) if k in numeric_keys_s else v) for k, v in (all_test_metrics[0] if all_test_metrics else {}).items()} if all_test_metrics else None

    training_seconds = time.time() - t0
    hardware = _get_hardware_info()
    metrics = {
        "model_type": "fastai_tabular",
        "validation": validation_metrics,
        "test": test_metrics if test_metrics else None,
        "training_samples": int(len(df_train_final)),
        "validation_samples": int(len(df_valid_final)),
        "test_samples": int(len(df_test_final)),
        "cat_names": final_cat_names,
        "cont_names": final_cont_names,
        "y_name": Y_NAME,
        "split_strategy": final_split_strategy,
        "group_key": GROUP_KEY if final_split_strategy == "group" else None,
        "loss_type": LOSS_TYPE,
        "ensemble_size": ENSEMBLE_SIZE,
        "ensemble_seeds": seeds if ENSEMBLE_SIZE > 1 else None,
        "training_seconds": round(training_seconds, 2),
        "hardware": hardware,
        "trained_at": datetime.now().isoformat(),
    }
    if metrics["test"] is None:
        del metrics["test"]
    if metrics.get("ensemble_seeds") is None:
        del metrics["ensemble_seeds"]

    metrics_path = OUTPUT_DIR / "training_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\n[OK] Saved metrics: {metrics_path}")

    # Print results
    v = metrics["validation"]
    print("\n[METRICS] Validation:")
    print(f"  MAE:  ${v['mae']:,.0f}" if v.get('mae') is not None else "  MAE:  N/A")
    print(f"  RMSE: ${v['rmse']:,.0f}" if v.get('rmse') is not None else "  RMSE: N/A")
    print(f"  MAPE: {v['mape']:.1f}%" if v.get('mape') is not None else "  MAPE: N/A")
    print(f"  R2:   {v['r2']:.4f}" if v.get('r2') is not None else "  R2:   N/A")
    print(f"  P95 Error: ${v.get('p95_error'):,.0f}" if v.get('p95_error') is not None else "  P95 Error: N/A")
    print(f"  P99 Error: ${v.get('p99_error'):,.0f}" if v.get('p99_error') is not None else "  P99 Error: N/A")
    print(f"  Within ±10%: {v['within_10pct']:.1f}%")
    print(f"  Within ±15%: {v['within_15pct']:.1f}%")
    if metrics.get("test"):
        t = metrics["test"]
        print("\n[METRICS] Test:")
        print(f"  MAE:  ${t['mae']:,.0f}" if t.get('mae') is not None else "  MAE:  N/A")
        print(f"  RMSE: ${t['rmse']:,.0f}" if t.get('rmse') is not None else "  RMSE: N/A")
        print(f"  R2:   {t.get('r2'):.4f}" if t.get('r2') is not None else "  R2:   N/A")
        print(f"  P95 Error: ${t.get('p95_error'):,.0f}" if t.get('p95_error') is not None else "  P95 Error: N/A")
        print(f"  P99 Error: ${t.get('p99_error'):,.0f}" if t.get('p99_error') is not None else "  P99 Error: N/A")
    print("\n[COMPARE] Legacy baseline: MAE ~$3,269, RMSE ~$5,165, within ±10% ~39%, ±15% ~52%.")

    # Config for inference (feature list)
    if ENSEMBLE_SIZE > 1:
        export_paths = [f"export_seed{s}.pkl" for s in seeds]
    else:
        export_paths = ["export.pkl"]
    
    config = {
        "model_type": "fastai_tabular",
        "export_path": export_paths[0] if len(export_paths) == 1 else export_paths,
        "base_cat_names": final_cat_names,
        "base_cont_names": final_cont_names,
        "cat_names": final_cat_names,
        "cont_names": final_cont_names,
        "y_name": Y_NAME,
        "target_column": TARGET_COL,
        "min_price": MIN_PRICE,
        "max_price": MAX_PRICE,
        "split_strategy": final_split_strategy,
        "loss_type": LOSS_TYPE,
        "ensemble_size": ENSEMBLE_SIZE,
        "run_id": run_id,
        "data_fingerprint": data_fingerprint,
        "trained_at": metrics["trained_at"],
    }
    config_path = OUTPUT_DIR / "model_config.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"[OK] Saved config: {config_path}")

    # Append to EXPERIMENTS.md for reproducibility
    try:
        import subprocess
        r = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            cwd=REPO_ROOT,
            timeout=5,
        )
        git_hash = (r.stdout or "").strip() or "unknown"
    except Exception:
        git_hash = "unknown"
    exp_path = REPO_ROOT / "training" / "EXPERIMENTS.md"
    v = metrics["validation"]
    block = f"""
---
## Run (auto-appended)

**Commit:** `{git_hash}`  
**Seed:** {RANDOM_SEED}  
**Split:** {final_split_strategy} (GROUP_KEY={GROUP_KEY})  
**Loss:** {LOSS_TYPE}  
**Training time:** {training_seconds:.1f}s  
**Hardware:** {hardware}  
**Date:** {metrics['trained_at']}

| Set | MAE | RMSE | Unclipped RMSE | P95 | P99 | Within ±10% | ±15% |
|-----|-----|------|----------------|-----|-----|------------|------|
| Val | ${v.get('mae') or 0:,.0f} | ${v.get('rmse') or 0:,.0f} | ${v.get('unclipped_rmse') or v.get('rmse') or 0:,.0f} | ${v.get('p95_abs_error') or v.get('p95_error') or 0:,.0f} | ${v.get('p99_abs_error') or v.get('p99_error') or 0:,.0f} | {v.get('within_10pct') or 0:.1f}% | {v.get('within_15pct') or 0:.1f}% |
"""
    try:
        with open(exp_path, "a", encoding="utf-8") as f:
            f.write(block)
        print(f"[OK] Appended to {exp_path}")
    except Exception as e:
        print(f"[WARN] Could not append EXPERIMENTS.md: {e}")

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
