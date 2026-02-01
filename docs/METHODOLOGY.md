# Fair Price Predictor - Technical Methodology

## Overview

The Fair Price Used Car Predictor uses machine learning to estimate fair market values for used vehicles. This document details our technical approach, model architecture, and validation methodology.

## Data Pipeline

### 1. Data Collection

Our model is trained on the Craigslist vehicles dataset, which contains:
- Hundreds of thousands of real vehicle listings
- Geographic coverage across all US states
- Price, year, make, model, mileage, and condition data
- Additional attributes like transmission, fuel type, and drive type

### 2. Data Cleaning

We apply the following cleaning steps:

| Filter | Criteria | Reason |
|--------|----------|--------|
| Price bounds | $500 - $150,000 | Remove outliers and scam listings |
| Year bounds | 1990 - Present+1 | Focus on relevant vehicles |
| Mileage bounds | 0 - 500,000 | Remove data entry errors |
| Missing price | Remove | Cannot train without target |

### 3. Feature Engineering

**Numeric Features:**
- `year` - Model year
- `odometer` - Mileage in miles
- `car_age` - Calculated as current_year - year
- `log_odometer` - Log-transformed mileage (better distribution)

**Categorical Features (One-Hot Encoded):**
- `manufacturer` - Make of vehicle
- `model` - Specific model (truncated to first 3 words)
- `condition` - Vehicle condition rating
- `cylinders` - Engine configuration
- `fuel` - Fuel type (gas, diesel, electric, hybrid)
- `title_status` - Title status (clean, rebuilt, salvage)
- `transmission` - Automatic or manual
- `drive` - Drive type (FWD, RWD, 4WD/AWD)
- `type` - Body type (sedan, SUV, truck, etc.)
- `paint_color` - Exterior color
- `state` - US state

### 4. Target Transformation

We apply log transformation to the target variable (price):

```python
y_log = np.log1p(price)
# Predictions are inverse-transformed: np.expm1(y_pred)
```

This helps with:
- Normalizing the right-skewed price distribution
- Ensuring non-negative predictions
- Stabilizing variance across price ranges

## Model Architecture

### Main Prediction Model

**Algorithm:** Gradient Boosting Regressor (scikit-learn)

**Hyperparameters:**
```python
GradientBoostingRegressor(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.08,
    min_samples_split=10,
    min_samples_leaf=5,
    subsample=0.8,
    random_state=42,
    n_iter_no_change=15,
    validation_fraction=0.1
)
```

**Why Gradient Boosting?**
1. Handles non-linear relationships naturally
2. Works well with mixed feature types
3. Robust to outliers and missing values
4. Provides smooth, realistic predictions
5. Good balance of accuracy and interpretability

### Quantile Models

For prediction intervals, we train additional quantile regression models:

```python
# 10th percentile (low estimate)
GradientBoostingRegressor(loss='quantile', alpha=0.1)

# 50th percentile (median)
GradientBoostingRegressor(loss='quantile', alpha=0.5)

# 90th percentile (high estimate)
GradientBoostingRegressor(loss='quantile', alpha=0.9)
```

This provides an 80% prediction interval, meaning 80% of actual prices should fall within our predicted range.

## Preprocessing Pipeline

```python
preprocessor = ColumnTransformer([
    ('num', Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ]), numeric_features),
    
    ('cat', Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', max_categories=50))
    ]), categorical_features)
])
```

Key design decisions:
- Median imputation for numeric features (robust to outliers)
- "Unknown" imputation for categorical features
- `handle_unknown='ignore'` allows new categories at inference
- `max_categories=50` prevents feature explosion

## Evaluation Metrics

We evaluate on a held-out 20% test set:

| Metric | Description | Target |
|--------|-------------|--------|
| MAE | Mean Absolute Error | < $3,000 |
| RMSE | Root Mean Squared Error | < $5,000 |
| MAPE | Mean Absolute Percentage Error | < 20% |

## Feature Importance

Top features by importance (typical results):

1. **Year** (~30%): Strongest predictor
2. **Odometer** (~20%): Mileage impact
3. **Manufacturer** (~15%): Brand value
4. **Type** (~10%): Body style
5. **Drive** (~8%): 4WD premium
6. **Condition** (~5%): Condition rating
7. **Fuel** (~5%): Fuel type
8. **Others** (~7%): Transmission, color, etc.

## Comparable Cars Algorithm

We find similar vehicles using a similarity score:

```python
similarity = (
    0.3 * (1 - |year_diff| / 10) +
    0.3 * make_match +
    0.2 * model_match +
    0.2 * (1 - |odometer_diff| / 100000)
)
```

Filtering:
- Same manufacturer (preferred)
- Year ±2 years
- Top 10 by similarity score

## Explainability

We provide human-readable explanations by analyzing:

1. **Feature Importance**: Which features matter most
2. **Directional Impact**: Whether features increase or decrease price
3. **Magnitude Estimation**: Approximate dollar impact

Example output:
- "Low Mileage: +$1,200"
- "Vehicle Age (8 years): -$6,400"
- "4WD/AWD: +$2,500"

## Market Insights Generation

We automatically generate insights by computing:

1. **Depreciation Curve**: Median price by car age
2. **Mileage Bands**: Price by mileage ranges
3. **Manufacturer Analysis**: Price by make
4. **Feature Premiums**: Transmission, fuel, drive type impacts
5. **Top Value Models**: Best-retained value vehicles

## Limitations

1. **Data Recency**: Model reflects training data distribution
2. **Geographic Variation**: National averages may differ from local markets
3. **Missing Factors**: Options, packages, accident history not captured
4. **Extreme Values**: Very rare or exotic vehicles may be less accurate
5. **Market Conditions**: Economic changes not reflected in historical data

## Future Improvements

1. Add more recent data sources
2. Incorporate vehicle history reports
3. Regional price adjustments
4. Time-series modeling for market trends
5. Deep learning for image-based condition assessment

## References

- scikit-learn Gradient Boosting: https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting
- Quantile Regression: https://scikit-learn.org/stable/auto_examples/ensemble/plot_gradient_boosting_quantile.html
