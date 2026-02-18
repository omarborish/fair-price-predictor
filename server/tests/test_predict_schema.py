"""
Minimal tests: CarDetails schema (region optional) and predict returns float.
Run from repo root: PYTHONPATH=. pytest server/tests/ -v
Or from server/: pytest tests/ -v
"""
import pytest  # type: ignore[reportMissingImports]
from fastapi.testclient import TestClient

try:
    from server.main import app
except ImportError:
    from main import app

client = TestClient(app)


def test_car_details_accepts_region():
    """Region is optional in request body."""
    payload = {
        "year": 2020,
        "manufacturer": "toyota",
        "model": "camry",
        "odometer": 50000,
        "region": "atlanta",
    }
    # May 503 if no model loaded; we only check schema is accepted
    response = client.post("/predict", json=payload)
    # Either success (200) or service unavailable (503) is ok for this test
    assert response.status_code in (200, 503), response.text


def test_car_details_accepts_missing_region():
    """Request without region should be valid (backend uses state or 'unknown')."""
    payload = {
        "year": 2020,
        "manufacturer": "ford",
        "model": "f-150",
        "odometer": 60000,
        "state": "tx",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code in (200, 503), response.text


def test_predict_returns_float_when_models_loaded():
    """When models are loaded, response predicted_price is a number."""
    payload = {
        "year": 2019,
        "manufacturer": "honda",
        "model": "civic",
        "odometer": 40000,
        "state": "ca",
    }
    response = client.post("/predict", json=payload)
    if response.status_code == 503:
        pytest.skip("Models not loaded (503)")
    data = response.json()
    assert "predicted_price" in data
    assert isinstance(data["predicted_price"], (int, float))
    assert data["predicted_price"] > 0
