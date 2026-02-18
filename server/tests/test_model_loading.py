"""
Smoke tests for model loading and prediction.
Tests that models load correctly and produce valid predictions.
"""
import sys
from pathlib import Path

# Add repo root to path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

import numpy as np
import pandas as pd


def test_fastai_model_loading():
    """Test that FastAI model loads and predicts."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return True
    
    model_path = REPO_ROOT / "server" / "models" / "export.pkl"
    if not model_path.exists():
        print(f"[SKIP] Model not found: {model_path}")
        return True
    
    print(f"Loading model from {model_path}...")
    learn = load_learner(model_path)
    print("[OK] Model loaded successfully")
    
    # Test prediction with sample data
    from server.feature_engineering import add_engineered_features, ensure_region
    
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
    
    df = pd.DataFrame([sample_data])
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    
    # Get feature lists from model
    cat_names = learn.dls.cat_names
    cont_names = learn.dls.cont_names
    
    # Predict via test_dl (reliable tensor output; predict(row) can return TabularPandas)
    test_dl = learn.dls.test_dl(df[cat_names + cont_names])
    preds, _ = learn.get_preds(dl=test_dl)
    pred_log = float(preds[0].item() if hasattr(preds[0], 'item') else float(preds[0]))
    predicted_price = float(np.expm1(pred_log))
    
    assert np.isfinite(predicted_price), f"Prediction is not finite: {predicted_price}"
    assert predicted_price > 0, f"Prediction is not positive: {predicted_price}"
    assert predicted_price < 1_000_000, f"Prediction seems unreasonably high: {predicted_price}"
    
    print(f"[OK] Prediction successful: ${predicted_price:,.0f}")
    return True


def test_fastai_ensemble_loading():
    """Test that ensemble models load correctly."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return True
    
    import json
    config_path = REPO_ROOT / "server" / "models" / "model_config.json"
    if not config_path.exists():
        print(f"[SKIP] Config not found: {config_path}")
        return True
    
    with open(config_path) as f:
        cfg = json.load(f)
    
    ensemble_size = cfg.get("ensemble_size", 1)
    if ensemble_size <= 1:
        print("[SKIP] Not an ensemble model")
        return True
    
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
    return True


def test_prediction_without_region():
    """Test prediction when region is not provided (should use state fallback)."""
    try:
        from fastai.learner import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[SKIP] FastAI not installed")
        return True
    
    model_path = REPO_ROOT / "server" / "models" / "export.pkl"
    if not model_path.exists():
        print(f"[SKIP] Model not found: {model_path}")
        return True
    
    learn = load_learner(model_path)
    
    from server.feature_engineering import add_engineered_features, ensure_region
    
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
    
    df = pd.DataFrame([sample_data])
    df = ensure_region(df, region_col="region", state_col="state")
    df = add_engineered_features(df, year_col="year", odometer_col="odometer")
    
    cat_names = learn.dls.cat_names
    cont_names = learn.dls.cont_names
    
    test_dl = learn.dls.test_dl(df[cat_names + cont_names])
    preds, _ = learn.get_preds(dl=test_dl)
    pred_log = float(preds[0].item() if hasattr(preds[0], 'item') else float(preds[0]))
    predicted_price = float(np.expm1(pred_log))
    
    assert np.isfinite(predicted_price), f"Prediction is not finite: {predicted_price}"
    assert predicted_price > 0, f"Prediction is not positive: {predicted_price}"
    
    print(f"[OK] Prediction without region successful: ${predicted_price:,.0f}")
    return True


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
