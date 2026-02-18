"""
Smoke tests for /predict: no region, with region, finite outputs and bounds.
Uses FastAPI TestClient. Run: pytest server/tests/test_smoke_predict.py -v
Requires server/models/export.pkl (or legacy models) for predictions to succeed.
"""
import pytest
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)
MIN_PRICE = 500
MAX_PRICE = 250_000


def test_predict_without_region():
    """Predict with minimal payload; region omitted."""
    payload = {
        "year": 2020,
        "manufacturer": "toyota",
        "model": "camry",
        "odometer": 35000,
        "condition": "good",
        "fuel": "gas",
        "transmission": "automatic",
        "drive": "fwd",
        "type": "sedan",
    }
    response = client.post("/predict", json=payload)
    if response.status_code == 503:
        pytest.skip("No model loaded (run training first)")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert "price_range" in data
    assert "low" in data["price_range"] and "high" in data["price_range"]
    price = data["predicted_price"]
    low = data["price_range"]["low"]
    high = data["price_range"]["high"]
    assert isinstance(price, (int, float)) and isinstance(low, (int, float)) and isinstance(high, (int, float))
    assert MIN_PRICE <= price <= MAX_PRICE
    assert MIN_PRICE <= low <= MAX_PRICE
    assert MIN_PRICE <= high <= MAX_PRICE
    assert low <= high


def test_predict_with_region():
    """Predict with region (and state) set."""
    payload = {
        "year": 2019,
        "manufacturer": "honda",
        "model": "civic",
        "odometer": 42000,
        "condition": "excellent",
        "fuel": "gas",
        "transmission": "automatic",
        "drive": "fwd",
        "type": "sedan",
        "state": "ca",
        "region": "san francisco bay area",
    }
    response = client.post("/predict", json=payload)
    if response.status_code == 503:
        pytest.skip("No model loaded")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    price = data["predicted_price"]
    assert isinstance(price, (int, float))
    assert MIN_PRICE <= price <= MAX_PRICE
    assert data["price_range"]["low"] <= price <= data["price_range"]["high"]


def test_predict_finite_and_bounds():
    """Assert finite outputs and sensible bounds."""
    payload = {
        "year": 2018,
        "manufacturer": "ford",
        "model": "f-150",
        "odometer": 60000,
        "condition": "good",
        "fuel": "gas",
        "transmission": "automatic",
        "drive": "4wd",
        "type": "truck",
    }
    response = client.post("/predict", json=payload)
    if response.status_code == 503:
        pytest.skip("No model loaded")
    assert response.status_code == 200
    data = response.json()
    import math
    assert math.isfinite(data["predicted_price"])
    assert math.isfinite(data["price_range"]["low"])
    assert math.isfinite(data["price_range"]["high"])
    assert data["price_range"]["low"] >= MIN_PRICE
    assert data["price_range"]["high"] <= MAX_PRICE
