"""
Shared feature engineering for training and inference.
Used by both training/train_fastai.py and server inference so preprocessing is identical.
"""
from datetime import datetime
import numpy as np
import pandas as pd

CURRENT_YEAR = datetime.now().year

# Columns produced by add_engineered_features (for schema consistency)
ENGINEERED_CONT_NAMES = [
    "car_age",
    "miles_per_year",
    "log_odometer",
    "age_x_odometer",
    "age_x_miles_per_year",
    "age_div_odometer",
]


def _safe_float(x, default: float = 0.0) -> float:
    """Coerce to float, return default on invalid."""
    if pd.isna(x):
        return default
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def _safe_str(x, default: str = "unknown") -> str:
    """Coerce to string, normalize for categorical."""
    if pd.isna(x) or x is None or (isinstance(x, str) and not x.strip()):
        return default
    return str(x).strip().lower()


def add_engineered_features(df: pd.DataFrame, year_col: str = "year", odometer_col: str = "odometer") -> pd.DataFrame:
    """
    Add engineered and interaction features. Safe for missing values and zeros.
    Use the same year_col/odometer_col as in your schema (default year, odometer).
    """
    df = df.copy()
    year = df[year_col] if year_col in df.columns else CURRENT_YEAR
    odometer = df[odometer_col] if odometer_col in df.columns else 0

    # Ensure numeric
    if not np.issubdtype(df[year_col].dtype, np.number):
        year = pd.to_numeric(year, errors="coerce").fillna(CURRENT_YEAR)
    if not np.issubdtype(df[odometer_col].dtype, np.number):
        odometer = pd.to_numeric(odometer, errors="coerce").fillna(0)

    car_age = (CURRENT_YEAR - year).clip(lower=0)
    df["car_age"] = car_age
    df["miles_per_year"] = odometer / (car_age + 1)
    df["log_odometer"] = np.log1p(odometer.clip(lower=0))
    df["age_x_odometer"] = car_age * odometer.clip(lower=0)
    df["age_x_miles_per_year"] = car_age * (odometer.clip(lower=0) / (car_age + 1))
    df["age_div_odometer"] = car_age / (odometer.clip(lower=0) + 1)

    # manufacturer_model interaction (categorical)
    if "manufacturer" in df.columns and "model" in df.columns:
        mfr = df["manufacturer"].astype(str).str.lower().str.strip().replace("", "unknown")
        mdl = df["model"].astype(str).str.lower().str.strip().replace("", "unknown")
        df["manufacturer_model"] = mfr + "__" + mdl
    else:
        df["manufacturer_model"] = "unknown__unknown"

    # region_x_make (categorical) if both exist
    if "region" in df.columns and "manufacturer" in df.columns:
        r = df["region"].astype(str).str.lower().str.strip().replace("", "unknown")
        m = df["manufacturer"].astype(str).str.lower().str.strip().replace("", "unknown")
        df["region_x_make"] = r + "__" + m
    else:
        df["region_x_make"] = "unknown__unknown"

    return df


def ensure_region(df: pd.DataFrame, region_col: str = "region", state_col: str = "state") -> pd.DataFrame:
    """Ensure region column exists. If missing, fill from state or 'unknown'."""
    df = df.copy()
    if region_col not in df.columns:
        if state_col in df.columns:
            df[region_col] = df[state_col].fillna("unknown").astype(str).str.lower().str.strip()
        else:
            df[region_col] = "unknown"
    else:
        df[region_col] = df[region_col].fillna("unknown").astype(str).str.lower().str.strip()
    return df


def add_time_features(
    df: pd.DataFrame,
    posting_date_col: str = "posting_date",
    now: datetime | None = None,
) -> pd.DataFrame:
    """Add posting_month and posting_year. Training uses posting_date; inference defaults to now."""
    df = df.copy()
    if now is None:
        now = datetime.now()
    if posting_date_col in df.columns:
        dt = pd.to_datetime(df[posting_date_col], errors="coerce", utc=True)
    else:
        dt = pd.Series([pd.Timestamp(now)] * len(df), index=df.index)
    dt = dt.fillna(pd.Timestamp(now))
    dt = pd.to_datetime(dt, errors="coerce").fillna(pd.Timestamp(now))
    df["posting_year"] = dt.dt.year.astype("int32")
    df["posting_month"] = dt.dt.month.astype("int32")
    return df


def add_buckets(df: pd.DataFrame) -> pd.DataFrame:
    """Bucket car_age into categorical bins (non-linear depreciation regimes)."""
    df = df.copy()
    if "car_age" not in df.columns:
        return df
    bins = [-1, 2, 5, 10, 15, 25, 100]
    labels = ["0-2", "3-5", "6-10", "11-15", "16-25", "26+"]
    df["car_age_bucket"] = pd.cut(
        df["car_age"].clip(lower=0),
        bins=bins,
        labels=labels,
    ).astype(str)
    return df


def add_more_cont_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add log_miles_per_year and age_sq (inference-safe from existing columns)."""
    df = df.copy()
    if "miles_per_year" in df.columns:
        df["log_miles_per_year"] = np.log1p(df["miles_per_year"].clip(lower=0)).astype("float32")
    if "car_age" in df.columns:
        df["age_sq"] = (df["car_age"].clip(lower=0) ** 2).astype("float32")
    return df
