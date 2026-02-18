"""
Train CatBoost regressor on same engineered features and splits as FastAI.
Reads server/models/split_indices.json from a prior train_fastai.py run.
Saves server/models/catboost.cbm and catboost_config.json.
Run from repo root after: python training/train_fastai.py
"""
import json
import os
import sys
import time
from pathlib import Path

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
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET_COL = "price"
MIN_PRICE = 500
MAX_PRICE = 250_000
RANDOM_SEED = 42
Y_NAME = "log_price"

# Must match FastAI CAT_NAMES / CONT_NAMES (from train_fastai.py)
CAT_COLS = [
    "manufacturer", "model", "condition", "fuel", "transmission", "drive",
    "type", "paint_color", "state", "region", "manufacturer_model", "region_x_make",
    "cylinders", "title_status", "car_age_bucket", "posting_month", "posting_year",
]
CONT_COLS = [
    "year", "odometer", "car_age", "miles_per_year", "log_odometer",
    "age_x_odometer", "age_x_miles_per_year", "age_div_odometer",
    "log_miles_per_year", "age_sq", "dealer_score",
]


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Same as train_fastai: ensure region, engineered, time, buckets, more cont."""
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
    # dealer_score from saved classifier (optional)
    dealer_path = OUTPUT_DIR / "dealer_clf.cbm"
    if dealer_path.exists():
        try:
            from catboost import CatBoostClassifier
            clf = CatBoostClassifier()
            clf.load_model(str(dealer_path))
            cfg_path = OUTPUT_DIR / "dealer_clf_config.json"
            cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
            feat_cols = cfg.get("feature_cols", [c for c in CAT_COLS + CONT_COLS if c in df.columns and c != "dealer_score"])
            Xd = df.reindex(columns=feat_cols, fill_value=0)
            for c in cfg.get("cat_cols", []):
                if c in Xd.columns and Xd[c].dtype != object:
                    Xd[c] = Xd[c].astype(str).replace("0", "unknown")
            df["dealer_score"] = clf.predict_proba(Xd)[:, 1]
        except Exception:
            df["dealer_score"] = 0.0
    else:
        df["dealer_score"] = 0.0
    df[Y_NAME] = np.log1p(df[TARGET_COL])
    return df


def main():
    t0 = time.time()
    print("CatBoost training (same features + splits as FastAI)")

    split_path = OUTPUT_DIR / "split_indices.json"
    if not split_path.exists():
        print(f"[ERROR] Run train_fastai.py first to create {split_path}")
        sys.exit(1)

    split = json.loads(split_path.read_text())
    train_idx = split["train_idx"]
    valid_idx = split["valid_idx"]

    if not DATA_PATH.exists():
        print(f"[ERROR] Data not found: {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, low_memory=False)
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df.dropna(subset=["price"])
    df = df[(df["price"] >= MIN_PRICE) & (df["price"] <= MAX_PRICE)].copy()
    df = prepare_dataframe(df)

    cat_cols = [c for c in CAT_COLS if c in df.columns]
    cont_cols = [c for c in CONT_COLS if c in df.columns]
    feature_cols = cat_cols + cont_cols

    X = df[feature_cols].copy()
    y = df[Y_NAME].values

    # Align index: split indices are from the same df (after prepare_dataframe)
    X_train = X.iloc[train_idx]
    y_train = y[train_idx]
    X_valid = X.iloc[valid_idx]
    y_valid = y[valid_idx]

    try:
        from catboost import CatBoostRegressor, Pool
    except ImportError:
        print("[ERROR] pip install catboost")
        sys.exit(1)

    train_pool = Pool(X_train, y_train, cat_features=cat_cols)
    valid_pool = Pool(X_valid, y_valid, cat_features=cat_cols)

    model = CatBoostRegressor(
        loss_function="RMSE",
        random_seed=RANDOM_SEED,
        depth=10,
        learning_rate=0.05,
        iterations=5000,
        eval_metric="RMSE",
        od_type="Iter",
        od_wait=200,
        verbose=200,
    )
    model.fit(train_pool, eval_set=valid_pool, use_best_model=True)

    out_path = OUTPUT_DIR / "catboost.cbm"
    model.save_model(str(out_path))
    print(f"[OK] Saved {out_path}")

    meta = {
        "trained_seconds": round(time.time() - t0, 2),
        "cat_cols": cat_cols,
        "cont_cols": cont_cols,
        "feature_cols": feature_cols,
        "train_samples": len(X_train),
        "valid_samples": len(X_valid),
        "split_strategy": split.get("split_strategy"),
        "group_key": split.get("group_key"),
    }
    (OUTPUT_DIR / "catboost_config.json").write_text(json.dumps(meta, indent=2))
    print(f"[OK] Saved catboost_config.json")

    # Write ensemble_config.json if not present
    ensemble_path = OUTPUT_DIR / "ensemble_config.json"
    if not ensemble_path.exists():
        ensemble_path.write_text(json.dumps({
            "type": "blend",
            "w_fastai": 0.6,
            "w_catboost": 0.4,
        }, indent=2))
        print(f"[OK] Created {ensemble_path}")


if __name__ == "__main__":
    main()
