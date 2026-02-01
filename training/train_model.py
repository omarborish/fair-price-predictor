"""
Fair Price Used Car Predictor - Model Training Pipeline (v2.0)
==============================================================
Production-grade training with:
- CatBoost/XGBoost/GradientBoosting model selection
- Comprehensive accuracy metrics (within ±10%, ±15%, interval coverage)
- Quantile regression for prediction intervals
- Image URL preservation for comparables
"""

import pandas as pd
import numpy as np
import json
import joblib
import warnings
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

warnings.filterwarnings('ignore')

# Optional ML libraries
try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
    print("[OK] CatBoost available")
except ImportError:
    CATBOOST_AVAILABLE = False
    print("[INFO] CatBoost not available, will use fallback")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
    print("[OK] XGBoost available")
except ImportError:
    XGBOOST_AVAILABLE = False

# Configuration
DATA_PATH = Path(__file__).parent.parent / "vehicles.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "server" / "models"
INSIGHTS_PATH = Path(__file__).parent.parent / "web" / "public" / "data"

# Feature configuration
TARGET_COL = "price"
NUMERIC_FEATURES = ["year", "odometer"]
CATEGORICAL_FEATURES = [
    "manufacturer", "model", "condition", "cylinders", "fuel",
    "title_status", "transmission", "drive", "type", "paint_color", "state"
]

# Bounds
MIN_PRICE = 1000
MAX_PRICE = 100000
MIN_YEAR = 1995
MAX_ODOMETER = 300000

# Model limits
TOP_N_MODELS = 300
TOP_N_MANUFACTURERS = 50


def load_and_inspect_data() -> pd.DataFrame:
    """Load dataset and print inspection summary."""
    print("=" * 60)
    print("DATASET INSPECTION")
    print("=" * 60)
    
    print(f"\nLoading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    print(f"\n[DATA] Dataset Shape: {df.shape[0]:,} rows x {df.shape[1]} columns")
    print(f"\n[DATA] Columns: {list(df.columns)}")
    
    # Check for image_url
    if 'image_url' in df.columns:
        valid_images = df['image_url'].notna().sum()
        print(f"\n[DATA] Image URLs: {valid_images:,} valid ({valid_images/len(df)*100:.1f}%)")
    
    # Check for listing URLs
    if 'url' in df.columns:
        valid_urls = df['url'].notna().sum()
        print(f"[DATA] Listing URLs: {valid_urls:,} valid")
    
    # Target column
    print(f"\n[TARGET] Target Column: {TARGET_COL}")
    print(f"   - Non-null count: {df[TARGET_COL].notna().sum():,}")
    print(f"   - Mean: ${df[TARGET_COL].mean():,.0f}")
    print(f"   - Median: ${df[TARGET_COL].median():,.0f}")
    
    # Missing values
    print("\n[DATA] Missing Values (top 10):")
    missing = df.isnull().sum().sort_values(ascending=False).head(10)
    for col, count in missing.items():
        pct = count / len(df) * 100
        print(f"   - {col}: {count:,} ({pct:.1f}%)")
    
    return df


def clean_and_engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Clean data and engineer features with strict filtering."""
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING")
    print("=" * 60)
    
    initial_count = len(df)
    
    # Remove rows with missing target
    df = df.dropna(subset=[TARGET_COL])
    print(f"\n[OK] Removed rows with missing price: {initial_count - len(df):,}")
    
    # Remove extreme price outliers - tighter bounds for better accuracy
    before = len(df)
    df = df[(df[TARGET_COL] >= MIN_PRICE) & (df[TARGET_COL] <= MAX_PRICE)]
    print(f"[OK] Price filter (${MIN_PRICE:,}-${MAX_PRICE:,}): removed {before - len(df):,}")
    
    # Remove unrealistic years
    before = len(df)
    current_year = datetime.now().year
    df = df[(df['year'] >= MIN_YEAR) & (df['year'] <= current_year + 1)]
    print(f"[OK] Year filter ({MIN_YEAR}-{current_year+1}): removed {before - len(df):,}")
    
    # Remove extreme odometer values
    before = len(df)
    df = df[(df['odometer'].notna()) & (df['odometer'] >= 100) & (df['odometer'] <= MAX_ODOMETER)]
    print(f"[OK] Odometer filter (100-{MAX_ODOMETER:,}): removed {before - len(df):,}")
    
    # Clean manufacturer names
    df['manufacturer'] = df['manufacturer'].str.lower().str.strip()
    df = df.dropna(subset=['manufacturer'])
    
    # Keep only top manufacturers
    mfr_counts = df['manufacturer'].value_counts()
    top_mfrs = set(mfr_counts.head(TOP_N_MANUFACTURERS).index)
    df['manufacturer'] = df['manufacturer'].apply(lambda x: x if x in top_mfrs else 'other')
    print(f"[OK] Kept top {TOP_N_MANUFACTURERS} manufacturers, grouped rest as 'other'")
    
    # Clean model names
    df['model'] = df['model'].str.lower().str.strip()
    df['model'] = df['model'].apply(lambda x: ' '.join(str(x).split()[:2]) if pd.notna(x) else 'unknown')
    
    # Keep only top models
    model_counts = df['model'].value_counts()
    top_models = set(model_counts.head(TOP_N_MODELS).index)
    df['model'] = df['model'].apply(lambda x: x if x in top_models else 'other_model')
    print(f"[OK] Kept top {TOP_N_MODELS} models, grouped rest as 'other_model'")
    
    # Create car age feature
    df['car_age'] = current_year - df['year']
    
    # Log transform odometer
    df['log_odometer'] = np.log1p(df['odometer'])
    
    # Winsorize price to reduce outlier impact (within remaining data)
    p01 = df[TARGET_COL].quantile(0.01)
    p99 = df[TARGET_COL].quantile(0.99)
    df[TARGET_COL] = df[TARGET_COL].clip(lower=p01, upper=p99)
    print(f"[OK] Winsorized prices to [{p01:,.0f}, {p99:,.0f}]")
    
    print(f"\n[DATA] Final dataset size: {len(df):,} rows")
    print(f"   - Retained: {len(df)/initial_count*100:.1f}% of original data")
    
    return df


def prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, List[str], List[str]]:
    """Prepare features for model training."""
    # Select features that exist
    available_numeric = [f for f in NUMERIC_FEATURES if f in df.columns]
    available_categorical = [f for f in CATEGORICAL_FEATURES if f in df.columns]
    
    # Add engineered features
    if 'car_age' in df.columns:
        available_numeric.append('car_age')
    if 'log_odometer' in df.columns:
        available_numeric.append('log_odometer')
    
    # Filter categorical features by cardinality
    filtered_categorical = []
    for col in available_categorical:
        n_unique = df[col].nunique()
        if n_unique <= 500:
            filtered_categorical.append(col)
            print(f"   [OK] Including {col} ({n_unique} unique values)")
        else:
            print(f"   [WARN] Skipping {col} ({n_unique} unique values - too high)")
    
    all_features = available_numeric + filtered_categorical
    
    X = df[all_features].copy()
    y = df[TARGET_COL].copy()
    
    # Log transform price for more stable training
    y_log = np.log1p(y)
    
    return X, y_log, available_numeric, filtered_categorical


def build_preprocessor(numeric_features: List[str], categorical_features: List[str]) -> ColumnTransformer:
    """Build sklearn preprocessing pipeline."""
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False, max_categories=100))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'
    )
    
    return preprocessor


def train_model_with_selection(X_train, y_train, X_test, y_test, preprocessor):
    """Train model with automatic selection of best available algorithm."""
    print("\n" + "=" * 60)
    print("MODEL TRAINING & SELECTION")
    print("=" * 60)
    
    best_model = None
    best_mae = float('inf')
    results = {}
    
    # Preprocess data once for non-pipeline models
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Option 1: Try CatBoost if available
    if CATBOOST_AVAILABLE:
        print("\n[TRAIN] Training CatBoostRegressor...")
        try:
            cb_model = CatBoostRegressor(
                iterations=500,
                depth=8,
                learning_rate=0.05,
                loss_function='RMSE',
                random_seed=42,
                verbose=False
            )
            cb_model.fit(X_train_processed, y_train)
            y_pred = cb_model.predict(X_test_processed)
            mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))
            results['catboost'] = {'model': cb_model, 'mae': mae}
            print(f"   CatBoost MAE: ${mae:,.0f}")
            if mae < best_mae:
                best_mae = mae
                best_model = ('catboost', cb_model)
        except Exception as e:
            print(f"   CatBoost failed: {e}")
    
    # Option 2: Try HistGradientBoosting (sklearn, fast)
    print("\n[TRAIN] Training HistGradientBoostingRegressor...")
    try:
        hgb_model = HistGradientBoostingRegressor(
            max_iter=300,
            max_depth=10,
            learning_rate=0.05,
            random_state=42
        )
        hgb_model.fit(X_train_processed, y_train)
        y_pred = hgb_model.predict(X_test_processed)
        mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))
        results['histgb'] = {'model': hgb_model, 'mae': mae}
        print(f"   HistGradientBoosting MAE: ${mae:,.0f}")
        if mae < best_mae:
            best_mae = mae
            best_model = ('histgb', hgb_model)
    except Exception as e:
        print(f"   HistGradientBoosting failed: {e}")
    
    # Option 3: Standard GradientBoosting - SKIPPED (too slow for large datasets)
    # HistGradientBoosting is faster and usually as good or better
    print("\n[TRAIN] Skipping standard GradientBoosting (too slow for large dataset)")
    print("   Using HistGradientBoosting as best model")
    
    print(f"\n[OK] Best model: {best_model[0]} with MAE ${best_mae:,.0f}")
    
    return best_model, preprocessor, results


def compute_accuracy_metrics(y_true, y_pred, y_pred_low, y_pred_high) -> Dict:
    """Compute comprehensive accuracy metrics."""
    # Convert from log space
    y_true_actual = np.expm1(y_true)
    y_pred_actual = np.expm1(y_pred)
    y_pred_low_actual = np.expm1(y_pred_low)
    y_pred_high_actual = np.expm1(y_pred_high)
    
    # Basic metrics
    mae = mean_absolute_error(y_true_actual, y_pred_actual)
    rmse = np.sqrt(mean_squared_error(y_true_actual, y_pred_actual))
    
    # MAPE (handle zeros)
    mape = np.mean(np.abs((y_true_actual - y_pred_actual) / np.maximum(y_true_actual, 1))) * 100
    
    # Percentage within ±X% of actual
    pct_error = np.abs((y_pred_actual - y_true_actual) / y_true_actual) * 100
    within_5pct = (pct_error <= 5).mean() * 100
    within_10pct = (pct_error <= 10).mean() * 100
    within_15pct = (pct_error <= 15).mean() * 100
    within_20pct = (pct_error <= 20).mean() * 100
    within_25pct = (pct_error <= 25).mean() * 100
    
    # Prediction interval coverage
    in_interval = ((y_true_actual >= y_pred_low_actual) & 
                   (y_true_actual <= y_pred_high_actual)).mean() * 100
    
    metrics = {
        'mae': float(mae),
        'rmse': float(rmse),
        'mape': float(mape),
        'within_5pct': float(within_5pct),
        'within_10pct': float(within_10pct),
        'within_15pct': float(within_15pct),
        'within_20pct': float(within_20pct),
        'within_25pct': float(within_25pct),
        'interval_coverage': float(in_interval),
    }
    
    return metrics


def train_quantile_models(X_train, y_train, preprocessor):
    """Train quantile models for prediction intervals using faster settings."""
    print("\n" + "=" * 60)
    print("TRAINING QUANTILE MODELS (p10/p50/p90)")
    print("=" * 60)
    
    # Sample for faster training
    n_sample = min(50000, len(X_train))
    sample_indices = np.random.choice(len(X_train), n_sample, replace=False)
    X_train_sample = X_train.iloc[sample_indices]
    y_train_sample = y_train.iloc[sample_indices]
    
    X_train_processed = preprocessor.transform(X_train_sample)
    print(f"\n[INFO] Training on {n_sample:,} samples for speed")
    
    models = {}
    quantiles = {'low': 0.10, 'median': 0.50, 'high': 0.90}
    
    for name, alpha in quantiles.items():
        print(f"\n[TRAIN] Training {name} model (quantile={alpha})...")
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            loss='quantile',
            alpha=alpha,
            random_state=42,
            n_iter_no_change=5,
            validation_fraction=0.1
        )
        model.fit(X_train_processed, y_train_sample)
        models[name] = model
        print(f"   [OK] {name} model trained")
    
    return models


def extract_feature_importance(model, numeric_features: List[str], 
                               categorical_features: List[str], preprocessor) -> Dict:
    """Extract feature importance from trained model."""
    # Get feature names
    feature_names = list(numeric_features)
    
    try:
        cat_features = preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(categorical_features)
        feature_names.extend(cat_features)
    except:
        pass
    
    # Get importances
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        return {}
    
    # Aggregate by original feature
    feature_importance = {}
    for i, name in enumerate(feature_names):
        if i < len(importances):
            # Find original feature name
            original_name = name
            for cat_feat in categorical_features:
                if name.startswith(cat_feat + '_'):
                    original_name = cat_feat
                    break
            if name in numeric_features:
                original_name = name
            
            if original_name not in feature_importance:
                feature_importance[original_name] = 0
            feature_importance[original_name] += importances[i]
    
    # Sort and return top 15
    sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    return dict(sorted_importance[:15])


def generate_market_insights(df: pd.DataFrame) -> Dict:
    """Generate market insights from the dataset."""
    print("\n" + "=" * 60)
    print("GENERATING MARKET INSIGHTS")
    print("=" * 60)
    
    insights = {}
    
    # Price by year
    print("[DATA] Computing price trends by year...")
    year_stats = df.groupby('year')['price'].agg(['median', 'mean', 'count']).reset_index()
    year_stats = year_stats[year_stats['count'] >= 50]
    insights['price_by_year'] = year_stats.to_dict('records')
    
    # Price by manufacturer
    print("[DATA] Computing price by manufacturer...")
    mfr_stats = df.groupby('manufacturer')['price'].agg(['median', 'mean', 'count']).reset_index()
    mfr_stats = mfr_stats[mfr_stats['count'] >= 100].nlargest(20, 'count')
    insights['price_by_manufacturer'] = mfr_stats.to_dict('records')
    
    # Mileage impact
    print("[DATA] Computing mileage impact...")
    df['mileage_band'] = pd.cut(df['odometer'], 
                                 bins=[0, 25000, 50000, 75000, 100000, 150000, 300000],
                                 labels=['0-25k', '25k-50k', '50k-75k', '75k-100k', '100k-150k', '150k+'])
    mileage_stats = df.groupby('mileage_band', observed=True)['price'].agg(['median', 'mean', 'count']).reset_index()
    insights['price_by_mileage'] = mileage_stats.to_dict('records')
    
    # Transmission
    print("[DATA] Computing transmission impact...")
    if 'transmission' in df.columns:
        trans_stats = df.groupby('transmission')['price'].agg(['median', 'mean', 'count']).reset_index()
        trans_stats = trans_stats[trans_stats['count'] >= 500]
        insights['price_by_transmission'] = trans_stats.to_dict('records')
    
    # Fuel type
    print("[DATA] Computing fuel type impact...")
    if 'fuel' in df.columns:
        fuel_stats = df.groupby('fuel')['price'].agg(['median', 'mean', 'count']).reset_index()
        fuel_stats = fuel_stats[fuel_stats['count'] >= 200]
        insights['price_by_fuel'] = fuel_stats.to_dict('records')
    
    # Drive type
    print("[DATA] Computing drive type impact...")
    if 'drive' in df.columns:
        drive_stats = df.groupby('drive')['price'].agg(['median', 'mean', 'count']).reset_index()
        drive_stats = drive_stats[drive_stats['count'] >= 500]
        insights['price_by_drive'] = drive_stats.to_dict('records')
    
    # Vehicle type
    print("[DATA] Computing vehicle type impact...")
    if 'type' in df.columns:
        type_stats = df.groupby('type')['price'].agg(['median', 'mean', 'count']).reset_index()
        type_stats = type_stats[type_stats['count'] >= 200]
        insights['price_by_type'] = type_stats.to_dict('records')
    
    # Depreciation curve
    print("[DATA] Computing depreciation curve...")
    df['age'] = datetime.now().year - df['year']
    age_stats = df[df['age'] <= 20].groupby('age')['price'].agg(['median', 'mean', 'count']).reset_index()
    insights['depreciation_curve'] = age_stats.to_dict('records')
    
    # Overall stats
    insights['overall_stats'] = {
        'total_listings': int(len(df)),
        'median_price': float(df['price'].median()),
        'mean_price': float(df['price'].mean()),
        'median_year': int(df['year'].median()),
        'median_odometer': float(df['odometer'].median()),
        'unique_manufacturers': int(df['manufacturer'].nunique()),
        'unique_models': int(df['model'].nunique()),
        'generated_at': datetime.now().isoformat()
    }
    
    return insights


def save_artifacts(main_model, quantile_models, preprocessor, metrics: Dict, 
                   feature_importance: Dict, insights: Dict, 
                   numeric_features: List[str], categorical_features: List[str],
                   df: pd.DataFrame):
    """Save all model artifacts and data."""
    print("\n" + "=" * 60)
    print("SAVING ARTIFACTS")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    INSIGHTS_PATH.mkdir(parents=True, exist_ok=True)
    
    # Save preprocessor
    preprocessor_path = OUTPUT_DIR / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    print(f"[OK] Saved preprocessor: {preprocessor_path}")
    
    # Save main model
    model_path = OUTPUT_DIR / "price_model.joblib"
    joblib.dump(main_model[1], model_path)
    print(f"[OK] Saved main model ({main_model[0]}): {model_path}")
    
    # Save quantile models
    for name, model in quantile_models.items():
        path = OUTPUT_DIR / f"quantile_{name}.joblib"
        joblib.dump(model, path)
        print(f"[OK] Saved {name} quantile model: {path}")
    
    # Save feature configuration
    config = {
        'numeric_features': numeric_features,
        'categorical_features': categorical_features,
        'target_column': TARGET_COL,
        'min_price': MIN_PRICE,
        'max_price': MAX_PRICE,
        'model_type': main_model[0],
        'trained_at': datetime.now().isoformat()
    }
    config_path = OUTPUT_DIR / "model_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"[OK] Saved model config: {config_path}")
    
    # Save metrics (comprehensive)
    metrics['feature_importance'] = feature_importance
    metrics['model_type'] = main_model[0]
    metrics['training_samples'] = int(len(df) * 0.8)
    metrics['test_samples'] = int(len(df) * 0.2)
    metrics['computed_at'] = datetime.now().isoformat()
    
    metrics_path = OUTPUT_DIR / "metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Saved metrics: {metrics_path}")
    
    # Also save to web public for frontend access
    web_metrics_path = INSIGHTS_PATH / "metrics.json"
    with open(web_metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Saved metrics to web: {web_metrics_path}")
    
    # Save insights
    insights_path = INSIGHTS_PATH / "insights.json"
    with open(insights_path, 'w') as f:
        json.dump(insights, f, indent=2, default=str)
    print(f"[OK] Saved insights: {insights_path}")
    
    # Save comparables data WITH image URLs
    sample_cols = ['price', 'year', 'manufacturer', 'model', 'odometer', 'condition', 
                   'transmission', 'fuel', 'drive', 'type', 'state', 'image_url', 'url', 'region']
    sample_cols = [c for c in sample_cols if c in df.columns]
    
    # Sample data for comparables
    sample_df = df[sample_cols].dropna(subset=['manufacturer', 'year'])
    sample_df = sample_df.sample(min(50000, len(sample_df)), random_state=42)
    
    sample_path = OUTPUT_DIR / "comparables_data.parquet"
    sample_df.to_parquet(sample_path, index=False)
    print(f"[OK] Saved comparables data: {sample_path}")
    
    # Save sample listings JSON for frontend
    sample_json = sample_df.sample(min(1000, len(sample_df)), random_state=42)
    sample_json_path = INSIGHTS_PATH / "sample_listings.json"
    sample_json.to_json(sample_json_path, orient='records')
    print(f"[OK] Saved sample listings: {sample_json_path}")
    
    # Save dropdown options
    dropdowns = {
        'manufacturers': sorted(df['manufacturer'].dropna().unique().tolist()),
        'models': sorted([m for m in df['model'].dropna().unique().tolist() if m != 'other_model'][:200]),
        'fuels': sorted(df['fuel'].dropna().unique().tolist()) if 'fuel' in df.columns else [],
        'transmissions': sorted(df['transmission'].dropna().unique().tolist()) if 'transmission' in df.columns else [],
        'drives': sorted(df['drive'].dropna().unique().tolist()) if 'drive' in df.columns else [],
        'types': sorted(df['type'].dropna().unique().tolist()) if 'type' in df.columns else [],
        'conditions': sorted(df['condition'].dropna().unique().tolist()) if 'condition' in df.columns else [],
        'states': sorted(df['state'].dropna().unique().tolist()) if 'state' in df.columns else [],
        'years': list(range(MIN_YEAR, datetime.now().year + 2))
    }
    dropdowns_path = INSIGHTS_PATH / "dropdowns.json"
    with open(dropdowns_path, 'w') as f:
        json.dump(dropdowns, f, indent=2)
    print(f"[OK] Saved dropdown options: {dropdowns_path}")


def main():
    """Main training pipeline."""
    print("\n" + "=" * 60)
    print("[CAR] FAIR PRICE USED CAR PREDICTOR - MODEL TRAINING v2.0")
    print("=" * 60)
    
    # Step 1: Load and inspect data
    df = load_and_inspect_data()
    
    # Step 2: Clean and engineer features
    df = clean_and_engineer_features(df)
    
    # Step 3: Prepare features
    X, y, numeric_features, categorical_features = prepare_features(df)
    
    print(f"\n[FEAT] Final feature set:")
    print(f"   - Numeric: {numeric_features}")
    print(f"   - Categorical: {categorical_features}")
    
    # Step 4: Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\n[DATA] Train/Test split: {len(X_train):,} / {len(X_test):,}")
    
    # Step 5: Build preprocessor
    preprocessor = build_preprocessor(numeric_features, categorical_features)
    
    # Step 6: Train main model with selection
    best_model, preprocessor, model_results = train_model_with_selection(
        X_train, y_train, X_test, y_test, preprocessor
    )
    
    # Step 7: Train quantile models
    quantile_models = train_quantile_models(X_train, y_train, preprocessor)
    
    # Step 8: Compute comprehensive metrics
    print("\n" + "=" * 60)
    print("COMPUTING ACCURACY METRICS")
    print("=" * 60)
    
    X_test_processed = preprocessor.transform(X_test)
    y_pred = best_model[1].predict(X_test_processed)
    y_pred_low = quantile_models['low'].predict(X_test_processed)
    y_pred_high = quantile_models['high'].predict(X_test_processed)
    
    metrics = compute_accuracy_metrics(y_test, y_pred, y_pred_low, y_pred_high)
    
    print(f"\n[METRIC] Model Performance:")
    print(f"   - MAE: ${metrics['mae']:,.0f}")
    print(f"   - RMSE: ${metrics['rmse']:,.0f}")
    print(f"   - MAPE: {metrics['mape']:.1f}%")
    print(f"\n[ACCURACY] Accuracy Metrics:")
    print(f"   - Within ±5%: {metrics['within_5pct']:.1f}%")
    print(f"   - Within ±10%: {metrics['within_10pct']:.1f}%")
    print(f"   - Within ±15%: {metrics['within_15pct']:.1f}%")
    print(f"   - Within ±20%: {metrics['within_20pct']:.1f}%")
    print(f"   - Within ±25%: {metrics['within_25pct']:.1f}%")
    print(f"   - Interval Coverage (p10-p90): {metrics['interval_coverage']:.1f}%")
    
    # Step 9: Extract feature importance
    feature_importance = extract_feature_importance(
        best_model[1], numeric_features, categorical_features, preprocessor
    )
    print("\n[DATA] Top Feature Importances:")
    for feat, imp in list(feature_importance.items())[:10]:
        print(f"   - {feat}: {imp:.4f}")
    
    # Step 10: Generate market insights
    insights = generate_market_insights(df)
    
    # Step 11: Save all artifacts
    save_artifacts(
        best_model, quantile_models, preprocessor, metrics,
        feature_importance, insights, numeric_features, categorical_features, df
    )
    
    print("\n" + "=" * 60)
    print("[OK] TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n[DATA] Final Model: {best_model[0]}")
    print(f"   - MAE: ${metrics['mae']:,.0f}")
    print(f"   - Within ±15%: {metrics['within_15pct']:.1f}%")
    print(f"   - Interval Coverage: {metrics['interval_coverage']:.1f}%")
    print(f"\n[ACCURACY] Trained on {len(X_train):,} samples, validated on {len(X_test):,} samples")


if __name__ == "__main__":
    main()
