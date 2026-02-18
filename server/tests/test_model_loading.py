"""
Smoke tests for model loading and prediction.
Tests that models load correctly and produce valid predictions.
"""
import json
import sys
from pathlib import Path
from datetime import datetime

# Add repo root to path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

import numpy as np
import pandas as pd


def _build_fastai_feature_df(sample_data: dict) -> pd.DataFrame:
    """
    Build a 1-row DataFrame with the same feature engineering as training/inference.
    Only base feature columns are passed into FastAI; FillMissing proc creates *_na.
    """
    from server.feature_engineering import (
        add_engineered_features,
        ensure_region,
        add_time_features,
        add_buckets,
        add_more_cont_features,
    )

    df = pd.DataFrame([sample_data])
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    df = add_time_features(df, posting_date_col="posting_date", now=datetime.now())
    df = add_buckets(df)
    df = add_more_cont_features(df)
    if "posting_date" in df.columns:
        df = df.drop(columns=["posting_date"])
    if "dealer_score" not in df.columns:
        df["dealer_score"] = 0.0

    cfg_path = REPO_ROOT / "server" / "models" / "model_config.json"
    cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
    base_cat = cfg.get("base_cat_names") or [c for c in cfg.get("cat_names", []) if not str(c).endswith("_na")]
    base_cont = cfg.get("base_cont_names") or [c for c in cfg.get("cont_names", []) if not str(c).endswith("_na")]

    df = df.reindex(columns=base_cat + base_cont)
    for c in base_cat:
        if c in df.columns:
            df[c] = df[c].astype("object")
    for c in base_cont:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def test_fastai_model_loading():
    """Test that FastAI model loads and predicts."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return
    
    model_path = REPO_ROOT / "server" / "models" / "export.pkl"
    if not model_path.exists():
        print(f"[SKIP] Model not found: {model_path}")
        return
    
    print(f"Loading model from {model_path}...")
    learn = load_learner(model_path)
    print("[OK] Model loaded successfully")
    
    # Test prediction with sample data
    sample_data = {
        "year": 2020,
        "odometer": 50000,
        "manufacturer": "toyota",
        "model": "camry",
        "condition": "excellent",
        "fuel": "gas",
        "transmission": "automatic",
        "drive": "fwd",
        "type": "sedan",
        "paint_color": "white",
        "state": "ca",
        "region": "los angeles",
        "cylinders": "4",
        "title_status": "clean",
    }

    df = _build_fastai_feature_df(sample_data)
    # Predict via test_dl (reliable tensor output; ensures same preprocessing as training)
    test_dl = learn.dls.test_dl(df, bs=1, num_workers=0)
    preds, _ = learn.get_preds(dl=test_dl)
    pred_log = float(preds[0].item() if hasattr(preds[0], 'item') else float(preds[0]))
    predicted_price = float(np.expm1(pred_log))
    
    assert np.isfinite(predicted_price), f"Prediction is not finite: {predicted_price}"
    assert predicted_price > 0, f"Prediction is not positive: {predicted_price}"
    assert predicted_price < 1_000_000, f"Prediction seems unreasonably high: {predicted_price}"
    
    print(f"[OK] Prediction successful: ${predicted_price:,.0f}")


def test_fastai_ensemble_loading():
    """Test that ensemble models load correctly."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return
    
    config_path = REPO_ROOT / "server" / "models" / "model_config.json"
    if not config_path.exists():
        print(f"[SKIP] Config not found: {config_path}")
        return
    
    with open(config_path) as f:
        cfg = json.load(f)
    
    ensemble_size = cfg.get("ensemble_size", 1)
    if ensemble_size <= 1:
        print("[SKIP] Not an ensemble model")
        return
    
    export_paths = cfg.get("export_path", [])
    if isinstance(export_paths, str):
        export_paths = [export_paths]
    
    print(f"Loading ensemble ({ensemble_size} models)...")
    learners = []
    for path in export_paths:
        full_path = REPO_ROOT / "server" / "models" / path
        if full_path.exists():
            learner = load_learner(full_path)
            learners.append(learner)
            print(f"[OK] Loaded: {path}")
        else:
            print(f"[WARN] Missing: {full_path}")
    
    assert len(learners) > 0, "No ensemble models loaded"
    print(f"[OK] Ensemble loaded: {len(learners)} models")


def test_prediction_without_region():
    """Test prediction when region is not provided (should use state fallback)."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return
    
    model_path = REPO_ROOT / "server" / "models" / "export.pkl"
    if not model_path.exists():
        print(f"[SKIP] Model not found: {model_path}")
        return
    
    learn = load_learner(model_path)
    
    # Sample without region
    sample_data = {
        "year": 2018,
        "odometer": 60000,
        "manufacturer": "honda",
        "model": "accord",
        "condition": "good",
        "fuel": "gas",
        "transmission": "automatic",
        "drive": "fwd",
        "type": "sedan",
        "paint_color": "black",
        "state": "ny",  # No region provided
        "cylinders": "4",
        "title_status": "clean",
    }

    df = _build_fastai_feature_df(sample_data)
    test_dl = learn.dls.test_dl(df, bs=1, num_workers=0)
    preds, _ = learn.get_preds(dl=test_dl)
    pred_log = float(preds[0].item() if hasattr(preds[0], 'item') else float(preds[0]))
    predicted_price = float(np.expm1(pred_log))
    
    assert np.isfinite(predicted_price), f"Prediction is not finite: {predicted_price}"
    assert predicted_price > 0, f"Prediction is not positive: {predicted_price}"
    
    print(f"[OK] Prediction without region successful: ${predicted_price:,.0f}")
    return


def main():
    """Run all smoke tests."""
    print("=" * 60)
    print("MODEL LOADING SMOKE TESTS")
    print("=" * 60)
    
    tests = [
        ("FastAI Model Loading", test_fastai_model_loading),
        ("FastAI Ensemble Loading", test_fastai_ensemble_loading),
        ("Prediction Without Region", test_prediction_without_region),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        print(f"\n[{name}]")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"[FAIL] {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
