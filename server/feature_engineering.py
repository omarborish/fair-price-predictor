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
