"""
Train a dealer-vs-private classifier using weak labels from description (keyword rules).
Uses ONLY inference-available structured fields so dealer_score can be computed at predict time.
Saves server/models/dealer_clf.cbm (or .joblib). At inference, dealer_score defaults to 0.0 if missing.
Run from repo root after preparing data (same as train_fastai).
"""
import json
import re
import sys
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

RANDOM_SEED = 42

# Weak-label rules: description contains any of these -> is_dealer_weak = 1
DEALER_KEYWORDS = re.compile(
    r"\b(dealer|financing|warranty|call today|open (?:seven|7) days|trade.?in|we finance|no credit|bad credit|in.?house)\b",
    re.I,
)


def weak_label_dealer(df: pd.DataFrame, description_col: str = "description") -> pd.Series:
    """Binary weak label from description keywords."""
    if description_col not in df.columns:
        return pd.Series(0, index=df.index)
    desc = df[description_col].fillna("").astype(str)
    return desc.str.contains(DEALER_KEYWORDS, regex=True).astype(int)


def prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Same feature engineering as train_fastai (inference-available only)."""
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
    return df


def main():
    print("Dealer classifier (weak labels from description, features inference-available only)")

    if not DATA_PATH.exists():
        print(f"[ERROR] Data not found: {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, low_memory=False)
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df.dropna(subset=["price"])
    df = df[(df["price"] >= 500) & (df["price"] <= 250_000)].copy()
    df = prepare_df(df)

    y_weak = weak_label_dealer(df)
    print(f"Weak label balance: dealer={y_weak.sum():,} ({100 * y_weak.mean():.1f}%)")

    # Features that exist at inference (no description, no url, etc.)
    cat_cols = [
        "manufacturer", "model", "condition", "fuel", "transmission", "drive",
        "type", "paint_color", "state", "region", "manufacturer_model", "region_x_make",
        "cylinders", "title_status", "car_age_bucket", "posting_month", "posting_year",
    ]
    cont_cols = [
        "year", "odometer", "car_age", "miles_per_year", "log_odometer",
        "age_x_odometer", "age_x_miles_per_year", "age_div_odometer",
        "log_miles_per_year", "age_sq",
    ]
    cat_cols = [c for c in cat_cols if c in df.columns]
    cont_cols = [c for c in cont_cols if c in df.columns]
    feature_cols = cat_cols + cont_cols

    X = df[feature_cols].copy()
    # Fill NaN for classifier
    for c in cat_cols:
        X[c] = X[c].fillna("unknown").astype(str)
    for c in cont_cols:
        X[c] = X[c].fillna(0)
    y = y_weak.values

    from sklearn.model_selection import train_test_split
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y)

    try:
        from catboost import CatBoostClassifier, Pool
        train_pool = Pool(X_train, y_train, cat_features=cat_cols)
        val_pool = Pool(X_val, y_val, cat_features=cat_cols)
        clf = CatBoostClassifier(
            iterations=500,
            depth=6,
            learning_rate=0.05,
            random_seed=RANDOM_SEED,
            verbose=100,
        )
        clf.fit(train_pool, eval_set=val_pool)
        out_path = OUTPUT_DIR / "dealer_clf.cbm"
        clf.save_model(str(out_path))
        print(f"[OK] Saved {out_path}")
        meta = {"cat_cols": cat_cols, "cont_cols": cont_cols, "feature_cols": feature_cols}
        (OUTPUT_DIR / "dealer_clf_config.json").write_text(json.dumps(meta, indent=2))
    except ImportError:
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import OneHotEncoder
        from sklearn.compose import ColumnTransformer
        # Simple pipeline: one-hot cat + cont
        ct = ColumnTransformer(
            [("onehot", OneHotEncoder(handle_unknown="ignore"), cat_cols)],
            remainder="passthrough",
        )
        Xt = ct.fit_transform(X_train)
        clf = LogisticRegression(max_iter=500, random_state=RANDOM_SEED)
        clf.fit(Xt, y_train)
        import joblib
        out_path = OUTPUT_DIR / "dealer_clf.joblib"
        joblib.dump({"clf": clf, "transformer": ct, "cat_cols": cat_cols, "cont_cols": cont_cols}, out_path)
        meta = {"cat_cols": cat_cols, "cont_cols": cont_cols, "feature_cols": feature_cols}
        (OUTPUT_DIR / "dealer_clf_config.json").write_text(json.dumps(meta, indent=2))
        print(f"[OK] Saved {out_path} (sklearn)")


if __name__ == "__main__":
    main()
