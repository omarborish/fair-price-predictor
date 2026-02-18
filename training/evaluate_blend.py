"""
Evaluate the production blend (0.6 FastAI + 0.4 CatBoost) on the test set.
Loads both models, gets test indices from split_indices.json, computes metrics,
and saves to server/models/training_metrics.json (blend section) and appends to EXPERIMENTS.md.

Run from repo root: python training/evaluate_blend.py
"""
import json
import random
import sys
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from server.feature_engineering import (
    add_engineered_features,
    ensure_region,
    add_time_features,
    add_buckets,
    add_more_cont_features,
)

DATA_PATH = REPO_ROOT / "vehicles.csv"
OUTPUT_DIR = REPO_ROOT / "server" / "models"
MIN_PRICE = 500
MAX_PRICE = 250_000
Y_NAME = "log_price"
TARGET_COL = "price"


def sanitize_prices(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce")
    df = df.dropna(subset=[TARGET_COL])
    df = df[(df[TARGET_COL] >= MIN_PRICE) & (df[TARGET_COL] <= MAX_PRICE)]
    return df


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Same as train_fastai / train_catboost."""
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
    # dealer_score from classifier
    dealer_joblib = OUTPUT_DIR / "dealer_clf.joblib"
    dealer_cbm = OUTPUT_DIR / "dealer_clf.cbm"
    cfg_path = OUTPUT_DIR / "dealer_clf_config.json"
    cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
    feat_cols = cfg.get("feature_cols", [])
    if dealer_cbm.exists():
        try:
            from catboost import CatBoostClassifier
            clf = CatBoostClassifier()
            clf.load_model(str(dealer_cbm))
            Xd = df.reindex(columns=feat_cols, fill_value=0).copy()
            for c in cfg.get("cat_cols", []):
                if c in Xd.columns:
                    Xd[c] = Xd[c].fillna("unknown").astype(str).replace("", "unknown")
            df["dealer_score"] = clf.predict_proba(Xd)[:, 1]
        except Exception:
            df["dealer_score"] = 0.0
    elif dealer_joblib.exists() and feat_cols:
        try:
            import joblib
            data = joblib.load(dealer_joblib)
            tr, clf = data.get("transformer"), data.get("clf")
            if tr is not None and clf is not None:
                Xd = df.reindex(columns=feat_cols, fill_value=0).copy()
                for c in cfg.get("cat_cols", []):
                    if c in Xd.columns:
                        Xd[c] = Xd[c].fillna("unknown").astype(str).replace("", "unknown")
                for c in cfg.get("cont_cols", []):
                    if c in Xd.columns:
                        Xd[c] = pd.to_numeric(Xd[c], errors="coerce").fillna(0)
                df["dealer_score"] = clf.predict_proba(tr.transform(Xd))[:, 1]
            else:
                df["dealer_score"] = 0.0
        except Exception:
            df["dealer_score"] = 0.0
    else:
        if "dealer_score" not in df.columns:
            df["dealer_score"] = 0.0
    df[Y_NAME] = np.log1p(df[TARGET_COL])
    return df


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """y_true, y_pred in dollars. Clip preds to [MIN_PRICE, MAX_PRICE] for metrics."""
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    y_pred = np.clip(y_pred, MIN_PRICE, MAX_PRICE).astype(float)
    valid = np.isfinite(y_true) & np.isfinite(y_pred)
    y_t, y_p = y_true[valid], y_pred[valid]
    if len(y_t) == 0:
        return {}
    return {
        "mae": float(mean_absolute_error(y_t, y_p)),
        "rmse": float(np.sqrt(mean_squared_error(y_t, y_p))),
        "mape": float(np.mean(np.abs((y_t - y_p) / (y_t + 1e-9))) * 100),
        "r2": float(r2_score(y_t, y_p)),
        "within_10pct": float(np.mean(np.abs(y_t - y_p) <= 0.10 * y_t) * 100),
        "within_15pct": float(np.mean(np.abs(y_t - y_p) <= 0.15 * y_t) * 100),
        "p95_abs_error": float(np.percentile(np.abs(y_t - y_p), 95)),
        "p99_abs_error": float(np.percentile(np.abs(y_t - y_p), 99)),
    }


def main():
    print("\n" + "=" * 60)
    print("BLEND EVALUATION (0.6 FastAI + 0.4 CatBoost) on test set")
    print("=" * 60)

    split_path = OUTPUT_DIR / "split_indices.json"
    if not split_path.exists():
        print(f"[ERROR] {split_path} not found. Run train_fastai.py first.")
        sys.exit(1)
    split = json.loads(split_path.read_text())
    test_idx = split.get("test_idx")
    if not test_idx:
        print("[ERROR] split_indices.json has no test_idx.")
        sys.exit(1)

    if not DATA_PATH.exists():
        print(f"[ERROR] {DATA_PATH} not found.")
        sys.exit(1)

    # Load and prepare data
    df = pd.read_csv(DATA_PATH, low_memory=False)
    df = sanitize_prices(df)
    df = prepare_dataframe(df)
    df_test = df.iloc[test_idx].copy()
    df_test = df_test.reset_index(drop=True)  # ensure 0-based order for FastAI test_dl
    y_true = np.expm1(df_test[Y_NAME].values)
    n_test = len(y_true)
    print(f"Test set: {n_test:,} samples")

    # Load configs
    model_config_path = OUTPUT_DIR / "model_config.json"
    ensemble_path = OUTPUT_DIR / "ensemble_config.json"
    if not model_config_path.exists():
        print(f"[ERROR] {model_config_path} not found.")
        sys.exit(1)
    model_config = json.loads(model_config_path.read_text())
    # Run/artifact mismatch check: require same run_id and data_fingerprint when both are present
    cfg_run_id = model_config.get("run_id")
    cfg_fingerprint = model_config.get("data_fingerprint")
    split_run_id = split.get("run_id")
    split_fingerprint = split.get("data_fingerprint")
    if cfg_run_id is not None and split_run_id is not None and cfg_run_id != split_run_id:
        raise RuntimeError(
            f"Artifact mismatch: model_config.run_id={cfg_run_id!r} != split_indices.run_id={split_run_id!r}. "
            "Retrain and regenerate artifacts (run train_fastai.py), then re-run evaluate_blend.py."
        )
    if cfg_fingerprint is not None and split_fingerprint is not None and cfg_fingerprint != split_fingerprint:
        raise RuntimeError(
            f"Artifact mismatch: model_config.data_fingerprint != split_indices.data_fingerprint. "
            "Retrain and regenerate artifacts (run train_fastai.py), then re-run evaluate_blend.py."
        )

    ensemble_config = json.loads(ensemble_path.read_text()) if ensemble_path.exists() else {"w_fastai": 0.6, "w_catboost": 0.4}
    w_fa = float(ensemble_config.get("w_fastai", 0.6))
    w_cb = float(ensemble_config.get("w_catboost", 0.4))
    # Base feature names (no FillMissing _na columns) for FastAI input schema
    base_cat = model_config.get("base_cat_names")
    base_cont = model_config.get("base_cont_names")
    if base_cat is None:
        base_cat = [c for c in model_config.get("cat_names", []) if not c.endswith("_na")]
    if base_cont is None:
        base_cont = [c for c in model_config.get("cont_names", []) if not c.endswith("_na")]

    # FastAI predictions (correct pipeline: base cols only, no global fillna(0), NaNs left for procs)
    export_path = OUTPUT_DIR / "export.pkl"
    pred_fastai_log = None
    if export_path.exists():
        try:
            from fastai.tabular.learner import load_learner
            learn = load_learner(export_path)
            # Build test DataFrame using ONLY base_cat_names + base_cont_names; do NOT fill NaNs with 0
            df_test_fa = df_test[base_cat + base_cont].copy()
            for c in base_cat:
                if c in df_test_fa.columns:
                    df_test_fa[c] = df_test_fa[c].astype("object")  # keep NaNs; do not fillna("unknown")
            for c in base_cont:
                if c in df_test_fa.columns:
                    df_test_fa[c] = pd.to_numeric(df_test_fa[c], errors="coerce")  # keep NaNs; FillMissing handles
            test_dl = learn.dls.test_dl(df_test_fa, bs=2048, num_workers=0)
            pred_fastai_log, _ = learn.get_preds(dl=test_dl)
            pred_fastai_log = pred_fastai_log.numpy().reshape(-1)
            assert len(pred_fastai_log) == len(y_true), "FastAI pred length != test size"

            # Sanity check: batch vs single-row predictions must match (same order/scale)
            rng = random.Random(42)
            idxs = rng.sample(range(len(df_test_fa)), min(10, len(df_test_fa)))
            for i in idxs:
                one = df_test_fa.iloc[[i]].copy()
                dl1 = learn.dls.test_dl(one, bs=1, num_workers=0)
                p1, _ = learn.get_preds(dl=dl1)
                batch_val = float(pred_fastai_log[i])
                single_val = float(p1.numpy().reshape(-1)[0])
                if abs(single_val - batch_val) > 1e-3:
                    raise RuntimeError(
                        f"Batch vs single-row mismatch at row {i}: batch={batch_val}, single={single_val}. "
                        f"Row dtypes: {one.dtypes.to_dict()}, columns: {list(one.columns)}"
                    )
            print("[OK] FastAI batch vs single-row sanity check passed (10 samples).")
        except Exception as e:
            print(f"[WARN] FastAI load/predict failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("[WARN] export.pkl not found; using CatBoost only for blend weight.")

    # CatBoost predictions
    cb_path = OUTPUT_DIR / "catboost.cbm"
    cb_config_path = OUTPUT_DIR / "catboost_config.json"
    pred_catboost_log = None
    if cb_path.exists():
        try:
            from catboost import CatBoostRegressor
            cb = CatBoostRegressor()
            cb.load_model(str(cb_path))
            cb_cfg = json.loads(cb_config_path.read_text()) if cb_config_path.exists() else {}
            feat_cols = cb_cfg.get("feature_cols", [c for c in cat_names + cont_names if c in df_test.columns and not c.endswith("_na")])
            cat_cols_cb = cb_cfg.get("cat_cols", [])
            X_test = df_test[feat_cols].copy()
            for c in cat_cols_cb:
                if c in X_test.columns:
                    X_test[c] = X_test[c].fillna("unknown").astype(str).replace("nan", "unknown")
            for c in cb_cfg.get("cont_cols", []):
                if c in X_test.columns:
                    X_test[c] = pd.to_numeric(X_test[c], errors="coerce").fillna(0)
            pred_catboost_log = cb.predict(X_test).reshape(-1)
        except Exception as e:
            print(f"[WARN] CatBoost load/predict failed: {e}")
    else:
        print("[WARN] catboost.cbm not found; using FastAI only for blend weight.")

    # Blend (in log space)
    log_min, log_max = np.log1p(MIN_PRICE), np.log1p(MAX_PRICE)
    if pred_fastai_log is not None:
        pred_fastai_log = np.clip(pred_fastai_log.astype(float), log_min, log_max)
        pred_fastai_log = np.where(np.isfinite(pred_fastai_log), pred_fastai_log, log_min)
    if pred_catboost_log is not None:
        pred_catboost_log = np.clip(pred_catboost_log.astype(float), log_min, log_max)
        pred_catboost_log = np.where(np.isfinite(pred_catboost_log), pred_catboost_log, log_min)

    if pred_fastai_log is not None and pred_catboost_log is not None:
        pred_blend_log = w_fa * pred_fastai_log + w_cb * pred_catboost_log
        blend_label = f"blend_{w_fa:.1f}fastai_{w_cb:.1f}catboost"
    elif pred_fastai_log is not None:
        pred_blend_log = pred_fastai_log
        blend_label = "fastai_only"
    elif pred_catboost_log is not None:
        pred_blend_log = pred_catboost_log
        blend_label = "catboost_only"
    else:
        print("[ERROR] No model predictions available.")
        sys.exit(1)

    pred_blend_log = np.clip(pred_blend_log.astype(float), log_min, log_max)
    pred_blend_log = np.where(np.isfinite(pred_blend_log), pred_blend_log, log_min)
    pred_blend_dollars = np.expm1(pred_blend_log)
    metrics = compute_metrics(y_true, pred_blend_dollars)

    fa_m = cb_m = None
    if pred_fastai_log is not None:
        fa_dollars = np.expm1(np.clip(pred_fastai_log.astype(float), log_min, log_max))
        fa_m = compute_metrics(y_true, fa_dollars)
        print(f"\n[COMPARE] FastAI only (test): MAE ${fa_m['mae']:,.0f}, within ±10% {fa_m['within_10pct']:.1f}%")
    if pred_catboost_log is not None:
        cb_dollars = np.expm1(np.clip(pred_catboost_log.astype(float), log_min, log_max))
        cb_m = compute_metrics(y_true, cb_dollars)
        print(f"[COMPARE] CatBoost only (test): MAE ${cb_m['mae']:,.0f}, within ±10% {cb_m['within_10pct']:.1f}%")
    print(f"\n[BLEND] {blend_label}")
    print(f"  MAE:  ${metrics['mae']:,.0f}")
    print(f"  RMSE: ${metrics['rmse']:,.0f}")
    print(f"  MAPE: {metrics['mape']:.1f}%")
    print(f"  R2:   {metrics['r2']:.4f}")
    print(f"  Within ±10%: {metrics['within_10pct']:.1f}%")
    print(f"  Within ±15%: {metrics['within_15pct']:.1f}%")
    print(f"  P95 abs error: ${metrics['p95_abs_error']:,.0f}")
    print(f"  P99 abs error: ${metrics['p99_abs_error']:,.0f}")

    # Save into training_metrics.json (merge with existing or create blend section)
    metrics_path = OUTPUT_DIR / "training_metrics.json"
    out = {}
    if metrics_path.exists():
        with open(metrics_path) as f:
            out = json.load(f)
    blend_save = {
        "model_type": "blend",
        "w_fastai": w_fa,
        "w_catboost": w_cb,
        "test_samples": n_test,
        "test": metrics,
        "evaluated_at": datetime.now().isoformat(),
    }
    out["blend_evaluation"] = blend_save
    with open(metrics_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\n[OK] Saved blend evaluation to {metrics_path}")

    # Append to EXPERIMENTS.md
    exp_path = REPO_ROOT / "training" / "EXPERIMENTS.md"
    section = f"""
## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  
**Test set:** {n_test:,} samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | ${metrics['mae']:,.0f} |
| RMSE | ${metrics['rmse']:,.0f} |
| MAPE | {metrics['mape']:.1f}% |
| R² | {metrics['r2']:.4f} |
| Within ±10% | {metrics['within_10pct']:.1f}% |
| Within ±15% | {metrics['within_15pct']:.1f}% |
| P95 abs error | ${metrics['p95_abs_error']:,.0f} |
| P99 abs error | ${metrics['p99_abs_error']:,.0f} |

"""
    if exp_path.exists():
        with open(exp_path, "a") as f:
            f.write(section)
        print(f"[OK] Appended blend evaluation to {exp_path}")
    else:
        with open(exp_path, "w") as f:
            f.write("# Model Training Experiments Log\n\n" + section)
        print(f"[OK] Wrote {exp_path}")

    print("\n[DONE] Blend evaluation complete.")


if __name__ == "__main__":
    main()
