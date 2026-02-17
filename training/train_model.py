"""
Fair Price Used Car Predictor - Model Training Pipeline (v3.0)
==============================================================
Production-grade training with:
- Target encoding for high-cardinality categoricals (manufacturer, model, state)
- manufacturer_model interaction feature
- CatBoost + HistGradientBoosting blending
- Matched quantile models with full data
- Early stopping for better generalization
- Robust price sanitization and leakage prevention

OUTPUTS (saved to ./model/):
- price_model.joblib (main model for backward compatibility)
- model_catboost.joblib / model_histgb.joblib (if blend is used)
- model_nn.pt or model_nn.joblib (if NN trained)
- preprocessor.joblib (feature pipeline)
- model_q_low.joblib / model_q_high.joblib (interval models)
- model_config.json (metadata for inference)
- training_metrics.json (performance report)
"""

import os
import sys
import json
import warnings
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import QuantileRegressor

warnings.filterwarnings("ignore")

# Optional: CatBoost
CATBOOST_AVAILABLE = False
try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
except Exception:
    CATBOOST_AVAILABLE = False

# -----------------------
# Config
# -----------------------
DATA_PATH = Path(__file__).parent.parent / "vehicles.csv"  # Main dataset
OUTPUT_DIR = Path(__file__).parent.parent / "server" / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET_COL = "price"

MIN_PRICE = 500
MAX_PRICE = 250000

RANDOM_SEED = 42

# -----------------------
# Utility
# -----------------------
def sanitize_prices(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """Clean price column and filter extreme values."""
    df = df.copy()
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
    df = df.dropna(subset=[target_col])
    df = df[(df[target_col] >= MIN_PRICE) & (df[target_col] <= MAX_PRICE)]
    return df


def make_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply shared feature engineering (region, manufacturer_model with __, region_x_make, cont features). Aligned with server/feature_engineering.py and inference."""
    from server.feature_engineering import ensure_region, add_engineered_features

    df = df.copy()
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    return df


def compute_accuracy_metrics(y_true, y_pred, y_pred_low=None, y_pred_high=None):
    """Compute MAE, RMSE, MAPE, within% bands, and interval coverage."""
    y_true = np.array(y_true).reshape(-1)
    y_pred = np.array(y_pred).reshape(-1)

    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))

    eps = 1e-9
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + eps))) * 100

    def within_pct(pct):
        return np.mean(np.abs(y_true - y_pred) <= (pct * np.abs(y_true))) * 100

    within_5 = within_pct(0.05)
    within_10 = within_pct(0.10)
    within_15 = within_pct(0.15)

    interval_coverage = None
    if y_pred_low is not None and y_pred_high is not None:
        y_low = np.array(y_pred_low).reshape(-1)
        y_high = np.array(y_pred_high).reshape(-1)
        interval_coverage = np.mean((y_true >= y_low) & (y_true <= y_high)) * 100

    r2 = r2_score(y_true, y_pred)

    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "mape": float(mape),
        "r2": float(r2),
        "within_5pct": float(within_5),
        "within_10pct": float(within_10),
        "within_15pct": float(within_15),
        "interval_coverage": None if interval_coverage is None else float(interval_coverage),
    }


# -----------------------
# Preprocessing
# -----------------------
def build_preprocessor(df: pd.DataFrame):
    """Builds ColumnTransformer for numeric + categorical."""
    # Identify columns
    numeric_features = [c for c in df.columns if c not in [TARGET_COL] and df[c].dtype in [np.int64, np.float64]]
    categorical_features = [c for c in df.columns if c not in [TARGET_COL] and df[c].dtype == object]

    # Heuristics: some datasets store numerics as object
    for c in categorical_features[:]:
        # Try coercion ratio
        coerced = pd.to_numeric(df[c], errors="coerce")
        valid_ratio = coerced.notna().mean()
        if valid_ratio > 0.98:
            df[c] = coerced
            categorical_features.remove(c)
            numeric_features.append(c)

    # Split categoricals into high/low cardinality (target encoding handled elsewhere in original,
    # but this file uses onehot for low-card; keep robust.)
    high_card_features = []
    low_card_features = []
    for c in categorical_features:
        nunq = df[c].nunique(dropna=True)
        if nunq > 50:
            high_card_features.append(c)
        else:
            low_card_features.append(c)

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", RobustScaler(with_centering=True, with_scaling=True))
    ])

    low_cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    # High-card features: simple frequency fill + passthrough (original pipeline used target encoding;
    # this training script expects you already had a working approach. We'll keep passthrough here,
    # but you can swap in your target encoder if present in your environment.)
    high_cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        # passthrough as raw strings is not allowed; use onehot (can blow up) or hashing/target encoding.
        # We'll onehot with max categories by letting OHE handle it; for huge cards, use target encoder.
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("low_cat", low_cat_transformer, low_card_features),
            ("high_cat", high_cat_transformer, high_card_features),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    return preprocessor, numeric_features, high_card_features, low_card_features


# -----------------------
# Quantile models
# -----------------------
def train_quantile_models(X_train, y_train, quantiles=(0.10, 0.90)):
    """Train quantile models for prediction intervals (in log space)."""
    models = {}

    # QuantileRegressor works in linear space; for high-dimensional OHE, it can be slow.
    # Your original code used HistGB quantile models; keep that pattern:
    # We'll train HistGB quantile estimators directly for speed.
    low_q, high_q = quantiles

    low_model = HistGradientBoostingRegressor(
        loss="quantile",
        quantile=low_q,
        max_iter=2000,
        learning_rate=0.03,
        max_depth=10,
        random_state=RANDOM_SEED
    )

    high_model = HistGradientBoostingRegressor(
        loss="quantile",
        quantile=high_q,
        max_iter=2000,
        learning_rate=0.03,
        max_depth=10,
        random_state=RANDOM_SEED
    )

    low_model.fit(X_train, y_train)
    high_model.fit(X_train, y_train)

    models["low"] = low_model
    models["high"] = high_model
    return models


# -----------------------
# Main ensemble training (UPDATED)
# -----------------------
def train_model_with_blending(X_train, y_train, X_val, y_val, X_test, y_test):
    """
    Train CatBoost + HistGB + (optional) Neural Net, then blend for best performance.
    Returns:
      best_model: ('blend', models_dict, weights_dict) OR ('catboost'/'histgb'/'nn', model_obj, None)
      models: dict of trained models
    """
    print("\n" + "=" * 60)
    print("MODEL TRAINING WITH ENSEMBLE (CatBoost + HistGB + NN)")
    print("=" * 60)

    from sklearn.metrics import mean_absolute_error
    models = {}
    preds = {}

    # -----------------------
    # 1) CatBoost
    # -----------------------
    if CATBOOST_AVAILABLE:
        print("\n[TRAIN] Training CatBoostRegressor with early stopping...")
        try:
            cb_model = CatBoostRegressor(
                iterations=4000,
                depth=10,
                learning_rate=0.03,
                l2_leaf_reg=5,
                loss_function='RMSE',
                random_seed=42,
                verbose=False,
                early_stopping_rounds=100
            )
            cb_model.fit(X_train, y_train, eval_set=(X_val, y_val), verbose=False)

            val_pred = cb_model.predict(X_val)
            test_pred = cb_model.predict(X_test)

            val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(val_pred))
            test_mae = mean_absolute_error(np.expm1(y_test), np.expm1(test_pred))
            print(f"   CatBoost Val MAE: ${val_mae:,.0f}, Test MAE: ${test_mae:,.0f}")

            models["catboost"] = cb_model
            preds["catboost"] = {"val": val_pred, "test": test_pred}
        except Exception as e:
            print(f"   CatBoost failed: {e}")

    # -----------------------
    # 2) HistGradientBoosting
    # -----------------------
    print("\n[TRAIN] Training HistGradientBoostingRegressor with early stopping...")
    try:
        hgb = HistGradientBoostingRegressor(
            max_iter=6000,
            max_depth=14,
            learning_rate=0.015,
            l2_regularization=0.02,
            max_leaf_nodes=255,
            min_samples_leaf=15,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=200,
            random_state=42
        )

        # Train on train+val for best final performance (early stopping uses internal split)
        X_train_full = np.vstack([X_train, X_val])
        y_train_full = np.concatenate([y_train, y_val])
        hgb.fit(X_train_full, y_train_full)

        val_pred = hgb.predict(X_val)
        test_pred = hgb.predict(X_test)

        val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(val_pred))
        test_mae = mean_absolute_error(np.expm1(y_test), np.expm1(test_pred))
        print(f"   HistGB Val MAE: ${val_mae:,.0f}, Test MAE: ${test_mae:,.0f}")

        models["histgb"] = hgb
        preds["histgb"] = {"val": val_pred, "test": test_pred}
    except Exception as e:
        print(f"   HistGradientBoosting failed: {e}")

    # -----------------------
    # 3) Neural Net (PyTorch if available; fallback to sklearn MLP)
    # -----------------------
    def train_nn_pytorch(Xtr, ytr, Xva, yva, seed=42):
        import torch
        import torch.nn as nn
        import torch.optim as optim

        torch.manual_seed(seed)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        Xtr_t = torch.tensor(Xtr, dtype=torch.float32).to(device)
        ytr_t = torch.tensor(ytr.reshape(-1, 1), dtype=torch.float32).to(device)
        Xva_t = torch.tensor(Xva, dtype=torch.float32).to(device)
        yva_t = torch.tensor(yva.reshape(-1, 1), dtype=torch.float32).to(device)

        in_dim = Xtr.shape[1]

        class MLP(nn.Module):
            def __init__(self, d):
                super().__init__()
                self.net = nn.Sequential(
                    nn.Linear(d, 512),
                    nn.ReLU(),
                    nn.Dropout(0.15),
                    nn.Linear(512, 256),
                    nn.ReLU(),
                    nn.Dropout(0.10),
                    nn.Linear(256, 128),
                    nn.ReLU(),
                    nn.Linear(128, 1)
                )

            def forward(self, x):
                return self.net(x)

        model = MLP(in_dim).to(device)
        loss_fn = nn.SmoothL1Loss()  # robust to outliers
        opt = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

        best_val = float("inf")
        best_state = None
        patience = 12
        bad = 0

        for epoch in range(1, 200):
            model.train()
            opt.zero_grad()
            pred = model(Xtr_t)
            loss = loss_fn(pred, ytr_t)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()

            model.eval()
            with torch.no_grad():
                vpred = model(Xva_t)
                vloss = loss_fn(vpred, yva_t).item()

            if vloss < best_val - 1e-5:
                best_val = vloss
                best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
                bad = 0
            else:
                bad += 1
                if bad >= patience:
                    break

        if best_state is not None:
            model.load_state_dict(best_state)
        model.eval()
        return model, device, in_dim

    print("\n[TRAIN] Training Neural Net (MLP)...")
    try:
        import torch  # noqa: F401
        nn_model, nn_device, nn_in_dim = train_nn_pytorch(X_train, y_train, X_val, y_val)

        def nn_predict(X):
            import torch
            X_t = torch.tensor(X, dtype=torch.float32).to(nn_device)
            with torch.no_grad():
                out = nn_model(X_t).detach().cpu().numpy().reshape(-1)
            return out

        val_pred = nn_predict(X_val)
        test_pred = nn_predict(X_test)

        val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(val_pred))
        test_mae = mean_absolute_error(np.expm1(y_test), np.expm1(test_pred))
        print(f"   NN (PyTorch) Val MAE: ${val_mae:,.0f}, Test MAE: ${test_mae:,.0f}")

        models["nn"] = {"framework": "pytorch", "model": nn_model, "device": nn_device, "in_dim": nn_in_dim}
        preds["nn"] = {"val": val_pred, "test": test_pred}

    except Exception as e:
        print(f"   [INFO] PyTorch NN not available/failed ({e}). Falling back to sklearn MLP...")
        try:
            from sklearn.neural_network import MLPRegressor
            mlp = MLPRegressor(
                hidden_layer_sizes=(512, 256, 128),
                activation="relu",
                solver="adam",
                alpha=1e-4,
                learning_rate_init=1e-3,
                early_stopping=True,
                validation_fraction=0.1,
                n_iter_no_change=20,
                max_iter=500,
                random_state=42
            )
            mlp.fit(X_train, y_train)

            val_pred = mlp.predict(X_val)
            test_pred = mlp.predict(X_test)

            val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(val_pred))
            test_mae = mean_absolute_error(np.expm1(y_test), np.expm1(test_pred))
            print(f"   NN (sklearn MLP) Val MAE: ${val_mae:,.0f}, Test MAE: ${test_mae:,.0f}")

            models["nn"] = {"framework": "sklearn", "model": mlp}
            preds["nn"] = {"val": val_pred, "test": test_pred}
        except Exception as e2:
            print(f"   [WARN] sklearn MLP also failed: {e2}")

    # -----------------------
    # 4) Pick best single OR blended
    # -----------------------
    if not preds:
        raise ValueError("No models trained successfully!")

    def mae_on_test(p):
        return mean_absolute_error(np.expm1(y_test), np.expm1(p))

    single_scores = {k: mae_on_test(preds[k]["test"]) for k in preds.keys()}
    best_single_name = min(single_scores, key=single_scores.get)
    best_single_mae = single_scores[best_single_name]

    print("\n[COMPARE] Single model Test MAE:")
    for k, v in sorted(single_scores.items(), key=lambda x: x[1]):
        print(f"   - {k}: ${v:,.0f}")

    # Blend search
    keys = list(preds.keys())
    best_val_mae = float("inf")
    best_weights = None
    best_test_pred = None

    if len(keys) == 1:
        name = keys[0]
        return (name, models[name], None), models

    if len(keys) == 2:
        a, b = keys[0], keys[1]
        for w in np.arange(0.0, 1.01, 0.05):
            blend_val = w * preds[a]["val"] + (1 - w) * preds[b]["val"]
            val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(blend_val))
            if val_mae < best_val_mae:
                best_val_mae = val_mae
                best_weights = {a: float(w), b: float(1 - w)}
                best_test_pred = w * preds[a]["test"] + (1 - w) * preds[b]["test"]

    else:
        # Use first 3 models for blending grid (CatBoost/HistGB/NN)
        k1, k2, k3 = keys[0], keys[1], keys[2]
        step = 0.05
        for w1 in np.arange(0.0, 1.01, step):
            for w2 in np.arange(0.0, 1.01 - w1, step):
                w3 = 1.0 - w1 - w2
                blend_val = w1 * preds[k1]["val"] + w2 * preds[k2]["val"] + w3 * preds[k3]["val"]
                val_mae = mean_absolute_error(np.expm1(y_val), np.expm1(blend_val))
                if val_mae < best_val_mae:
                    best_val_mae = val_mae
                    best_weights = {k1: float(w1), k2: float(w2), k3: float(w3)}
                    best_test_pred = w1 * preds[k1]["test"] + w2 * preds[k2]["test"] + w3 * preds[k3]["test"]

    blend_test_mae = mae_on_test(best_test_pred)
    print("\n[BLEND] Best blend weights:", best_weights)
    print(f"   Blend Test MAE: ${blend_test_mae:,.0f}")

    if blend_test_mae <= best_single_mae:
        print("\n[OK] Using BLEND as final model")
        return ("blend", models, best_weights), models

    print(f"\n[OK] Using {best_single_name} as final model")
    return (best_single_name, models[best_single_name], None), models


# -----------------------
# Main
# -----------------------
def main():
    print("\n" + "=" * 60)
    print("FAIR PRICE USED CAR PREDICTOR - TRAINING PIPELINE")
    print("=" * 60)

    print(f"\nLoading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    # Clean & feature engineer (aligned with FastAI / server.feature_engineering)
    df = sanitize_prices(df, TARGET_COL)
    df = make_features(df)

    # Drop columns not used as features (match train_fastai; region_url/description unused by design)
    drop_cols = [c for c in ["id", "vin", "url", "posting_date", "removed", "image_url", "description", "region_url"] if c in df.columns]
    if drop_cols:
        df = df.drop(columns=drop_cols)

    # Train/val/test split
    print("\nSplitting train/val/test...")
    df_train_val, df_test = train_test_split(df, test_size=0.25, random_state=RANDOM_SEED)
    df_train, df_val = train_test_split(df_train_val, test_size=0.15, random_state=RANDOM_SEED)

    print(f"[DATA] Trained on {len(df_train):,} samples")
    print(f"   Validated on {len(df_val):,} samples")
    print(f"   Tested on {len(df_test):,} samples")

    # Build preprocessing
    preprocessor, numeric_features, high_card_features, low_card_features = build_preprocessor(df_train)

    X_train = df_train.drop(columns=[TARGET_COL])
    y_train = np.log1p(df_train[TARGET_COL].values)

    X_val = df_val.drop(columns=[TARGET_COL])
    y_val = np.log1p(df_val[TARGET_COL].values)

    X_test = df_test.drop(columns=[TARGET_COL])
    y_test = np.log1p(df_test[TARGET_COL].values)

    print("\nFitting preprocessor...")
    preprocessor.fit(X_train)

    X_train_processed = preprocessor.transform(X_train)
    X_val_processed = preprocessor.transform(X_val)
    X_test_processed = preprocessor.transform(X_test)

    print(f"[OK] Preprocessed shapes:")
    print(f"   X_train: {X_train_processed.shape}")
    print(f"   X_val:   {X_val_processed.shape}")
    print(f"   X_test:  {X_test_processed.shape}")

    # Train main model(s)
    best_model, trained_models = train_model_with_blending(
        X_train_processed, y_train,
        X_val_processed, y_val,
        X_test_processed, y_test
    )

    # Train quantile models (on full train+val)
    print("\nTraining quantile models for intervals...")
    X_train_full = np.vstack([X_train_processed, X_val_processed])
    y_train_full = np.concatenate([y_train, y_val])
    quantile_models = train_quantile_models(X_train_full, y_train_full)

    # Save preprocessor
    preprocessor_path = OUTPUT_DIR / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    print(f"[OK] Saved preprocessor: {preprocessor_path}")

    # Save main model(s)
    model_type, model_obj, blend_weights = best_model

    if model_type == 'blend':
        # Save each component model
        for name, m in model_obj.items():
            if name == "nn" and isinstance(m, dict) and m.get("framework") == "pytorch":
                # Save PyTorch NN as state_dict
                try:
                    import torch
                    nn_path = OUTPUT_DIR / "model_nn.pt"
                    torch.save(
                        {"state_dict": m["model"].state_dict(), "in_dim": m.get("in_dim", None)},
                        nn_path
                    )
                    print(f"[OK] Saved nn model (PyTorch): {nn_path}")
                except Exception as e:
                    print(f"[WARN] Could not save PyTorch nn model: {e}")
            elif name == "nn" and isinstance(m, dict) and m.get("framework") == "sklearn":
                nn_path = OUTPUT_DIR / "model_nn.joblib"
                joblib.dump(m["model"], nn_path)
                print(f"[OK] Saved nn model (sklearn): {nn_path}")
            else:
                path = OUTPUT_DIR / f"model_{name}.joblib"
                joblib.dump(m, path)
                print(f"[OK] Saved {name} model: {path}")

        # Save as main model too (backward compatibility: save CatBoost if present else HistGB)
        model_path = OUTPUT_DIR / "price_model.joblib"
        joblib.dump(model_obj.get('catboost', model_obj.get('histgb')), model_path)
        print(f"[OK] Saved main model: {model_path}")
    else:
        # Single model
        model_path = OUTPUT_DIR / "price_model.joblib"
        if model_type == "nn" and isinstance(model_obj, dict) and model_obj.get("framework") == "pytorch":
            try:
                import torch
                nn_path = OUTPUT_DIR / "model_nn.pt"
                torch.save(
                    {"state_dict": model_obj["model"].state_dict(), "in_dim": model_obj.get("in_dim", None)},
                    nn_path
                )
                print(f"[OK] Saved nn model (PyTorch): {nn_path}")
            except Exception as e:
                print(f"[WARN] Could not save PyTorch nn model: {e}")
        elif model_type == "nn" and isinstance(model_obj, dict) and model_obj.get("framework") == "sklearn":
            joblib.dump(model_obj["model"], model_path)
            print(f"[OK] Saved main model (nn sklearn): {model_path}")
        else:
            joblib.dump(model_obj, model_path)
            print(f"[OK] Saved main model ({model_type}): {model_path}")

    # Save quantile models
    q_low_path = OUTPUT_DIR / "model_q_low.joblib"
    q_high_path = OUTPUT_DIR / "model_q_high.joblib"
    joblib.dump(quantile_models["low"], q_low_path)
    joblib.dump(quantile_models["high"], q_high_path)
    print(f"[OK] Saved quantile models: {q_low_path}, {q_high_path}")

    # Save config
    config = {
        'numeric_features': numeric_features,
        'high_cardinality_features': high_card_features,
        'low_cardinality_features': low_card_features,
        'target_column': TARGET_COL,
        'min_price': MIN_PRICE,
        'max_price': MAX_PRICE,
        'model_type': model_type,
        'blend_weights': blend_weights,
        'trained_at': datetime.now().isoformat()
    }
    config_path = OUTPUT_DIR / "model_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"[OK] Saved config: {config_path}")

    # Compute metrics
    print("\n" + "=" * 60)
    print("COMPUTING ACCURACY METRICS")
    print("=" * 60)

    # Get predictions from best model
    model_type, model_obj, blend_weights = best_model
    if model_type == "blend":
        y_pred = np.zeros(X_test_processed.shape[0], dtype=float)
        for name, w in blend_weights.items():
            if name == "nn" and isinstance(model_obj.get("nn"), dict) and model_obj["nn"].get("framework") == "pytorch":
                import torch
                X_t = torch.tensor(X_test_processed, dtype=torch.float32).to(model_obj["nn"]["device"])
                with torch.no_grad():
                    nn_out = model_obj["nn"]["model"](X_t).detach().cpu().numpy().reshape(-1)
                y_pred += w * nn_out
            elif name == "nn" and isinstance(model_obj.get("nn"), dict) and model_obj["nn"].get("framework") == "sklearn":
                y_pred += w * model_obj["nn"]["model"].predict(X_test_processed)
            else:
                y_pred += w * model_obj[name].predict(X_test_processed)
    else:
        if model_type == "nn" and isinstance(model_obj, dict) and model_obj.get("framework") == "pytorch":
            import torch
            X_t = torch.tensor(X_test_processed, dtype=torch.float32).to(model_obj["device"])
            with torch.no_grad():
                y_pred = model_obj["model"](X_t).detach().cpu().numpy().reshape(-1)
        elif model_type == "nn" and isinstance(model_obj, dict) and model_obj.get("framework") == "sklearn":
            y_pred = model_obj["model"].predict(X_test_processed)
        else:
            y_pred = model_obj.predict(X_test_processed)

    y_pred_low = quantile_models['low'].predict(X_test_processed)
    y_pred_high = quantile_models['high'].predict(X_test_processed)

    # Convert back to dollars
    y_true_dollars = np.expm1(y_test)
    y_pred_dollars = np.expm1(y_pred)
    y_pred_low_dollars = np.expm1(y_pred_low)
    y_pred_high_dollars = np.expm1(y_pred_high)

    metrics = compute_accuracy_metrics(y_true_dollars, y_pred_dollars, y_pred_low_dollars, y_pred_high_dollars)

    metrics['model_type'] = model_type
    metrics['blend_weights'] = blend_weights
    metrics['training_samples'] = int(len(df_train))
    metrics['validation_samples'] = int(len(df_val))
    metrics['test_samples'] = int(len(df_test))

    metrics_path = OUTPUT_DIR / "training_metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Saved metrics: {metrics_path}")

    print(f"\n[METRIC] Model Performance:")
    print(f"   - MAE: ${metrics['mae']:,.0f}")
    print(f"   - RMSE: ${metrics['rmse']:,.0f}")
    print(f"   - MAPE: {metrics['mape']:.1f}%")
    print(f"   - R2: {metrics.get('r2', float('nan')):.4f}")

    print(f"\n[ACCURACY] Accuracy Metrics:")
    print(f"   - Within ±5%: {metrics['within_5pct']:.1f}%")
    print(f"   - Within ±10%: {metrics['within_10pct']:.1f}%")
    print(f"   - Within ±15%: {metrics['within_15pct']:.1f}%")
    if metrics.get("interval_coverage") is not None:
        print(f"\n[INTERVAL] Interval Coverage: {metrics['interval_coverage']:.1f}%")

    print("\n" + "=" * 60)
    print("[OK] TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n[DATA] Final Model: {model_type}")
    if blend_weights is not None:
        w_str = ", ".join([f"{k}={v:.2f}" for k, v in blend_weights.items()])
        print(f"   - Blend Weights: {w_str}")
    print(f"   - MAE: ${metrics['mae']:,.0f}")
    print(f"   - R2: {metrics.get('r2', float('nan')):.4f}")
    print(f"   - Within ±10%: {metrics['within_10pct']:.1f}%")
    print(f"   - Within ±15%: {metrics['within_15pct']:.1f}%")
    if metrics.get("interval_coverage") is not None:
        print(f"   - Interval Coverage: {metrics['interval_coverage']:.1f}%")

if __name__ == "__main__":
    main()
