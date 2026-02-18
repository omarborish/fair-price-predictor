"""
Calibrate split conformal prediction interval.
Uses validation (or calibration) set residuals to compute qhat and saves server/models/conformal.json.
At inference, interval = [pred - qhat, pred + qhat] clipped to min/max price.
Run after train_fastai.py (uses same model and split_indices).
"""
import json
import sys
from pathlib import Path
import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

OUTPUT_DIR = REPO_ROOT / "server" / "models"
MIN_PRICE = 500
MAX_PRICE = 250_000
ALPHA = 0.1  # 1 - alpha = 90% coverage target


def main():
    print("Conformal calibration (split conformal, coverage target 1 - alpha = 90%)")
    try:
        from fastai.tabular.all import load_learner
    except ImportError:
        print("[ERROR] pip install fastai")
        sys.exit(1)

    export_path = OUTPUT_DIR / "export.pkl"
    if not export_path.exists():
        print(f"[ERROR] Run train_fastai.py first: {export_path}")
        sys.exit(1)

    split_path = OUTPUT_DIR / "split_indices.json"
    if not split_path.exists():
        print(f"[ERROR] split_indices.json not found. Run train_fastai.py first.")
        sys.exit(1)

    learn = load_learner(export_path)
    split = json.loads(split_path.read_text())
    valid_idx = split["valid_idx"]

    data_path = REPO_ROOT / "vehicles.csv"
    df = pd.read_csv(data_path, low_memory=False)
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df.dropna(subset=["price"])
    df = df[(df["price"] >= MIN_PRICE) & (df["price"] <= MAX_PRICE)].copy()

    from training.train_fastai import prepare_dataframe
    df = prepare_dataframe(df)
    cat_names = learn.dls.cat_names
    cont_names = learn.dls.cont_names
    y_name = "log_price"
    required = [c for c in cat_names + cont_names + [y_name] if c in df.columns]
    df_valid = df.iloc[valid_idx][required].dropna(subset=required)

    test_dl = learn.dls.test_dl(df_valid)
    preds_log, _ = learn.get_preds(dl=test_dl)
    preds_log = preds_log.numpy().reshape(-1)
    log_min, log_max = np.log1p(MIN_PRICE), np.log1p(MAX_PRICE)
    preds = np.expm1(np.clip(preds_log, log_min, log_max))
    y_true = np.expm1(df_valid[y_name].values)
    residuals = np.abs(preds - y_true)
    n = len(residuals)
    # Split conformal: qhat = (1-alpha) quantile of absolute residuals
    qhat = float(np.percentile(residuals, (1 - ALPHA) * 100))

    out = {
        "qhat": qhat,
        "alpha": ALPHA,
        "coverage_target": 1 - ALPHA,
        "calibration_samples": n,
        "min_price": MIN_PRICE,
        "max_price": MAX_PRICE,
    }
    (OUTPUT_DIR / "conformal.json").write_text(json.dumps(out, indent=2))
    print(f"[OK] Saved conformal.json (qhat={qhat:.0f})")


if __name__ == "__main__":
    main()
