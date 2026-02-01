"""
Fair Price Used Car Predictor - FastAPI Backend
================================================
REST API for car price predictions with explainability and comparables.
Production-hardened with rate limiting, security headers, and proper error handling.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from collections import defaultdict
import time
import hashlib

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Configuration
MODELS_DIR = Path(__file__).parent / "models"
DATA_DIR = Path(__file__).parent.parent / "web" / "public" / "data"

# Rate limiting configuration
RATE_LIMIT_PREDICTIONS = 60  # predictions per hour per IP
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds
MAX_REQUEST_SIZE = 1024 * 100  # 100KB max request size

# In-memory rate limit storage (use Redis in production for multi-instance)
rate_limit_store: Dict[str, List[float]] = defaultdict(list)
prediction_cache: Dict[str, Dict] = {}
CACHE_TTL = 3600  # 1 hour cache


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent API abuse."""
    
    async def dispatch(self, request: Request, call_next):
        # Only rate limit the predict endpoint
        if request.url.path == "/predict" and request.method == "POST":
            client_ip = self._get_client_ip(request)
            
            if not self._check_rate_limit(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Rate limit exceeded. Maximum 60 predictions per hour.",
                        "retry_after": 3600
                    }
                )
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _check_rate_limit(self, client_ip: str) -> bool:
        """Check if client is within rate limits."""
        current_time = time.time()
        window_start = current_time - RATE_LIMIT_WINDOW
        
        # Clean old entries
        rate_limit_store[client_ip] = [
            t for t in rate_limit_store[client_ip] if t > window_start
        ]
        
        # Check limit
        if len(rate_limit_store[client_ip]) >= RATE_LIMIT_PREDICTIONS:
            return False
        
        # Add current request
        rate_limit_store[client_ip].append(current_time)
        return True


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        if IS_PRODUCTION:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


# Initialize FastAPI app
app = FastAPI(
    title="Fair Price Used Car Predictor API",
    description="Get fair market price predictions for used cars with confidence intervals and explanations",
    version="1.0.0",
    docs_url="/docs" if not IS_PRODUCTION else None,  # Disable docs in production
    redoc_url="/redoc" if not IS_PRODUCTION else None,
)

# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS configuration - secure for production
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production origins from environment
PRODUCTION_FRONTEND_URL = os.getenv("FRONTEND_URL")
if PRODUCTION_FRONTEND_URL:
    ALLOWED_ORIGINS.append(PRODUCTION_FRONTEND_URL)
    # Also allow www variant
    if PRODUCTION_FRONTEND_URL.startswith("https://"):
        www_variant = PRODUCTION_FRONTEND_URL.replace("https://", "https://www.")
        ALLOWED_ORIGINS.append(www_variant)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=86400,  # Cache preflight for 24 hours
)


# Pydantic models
class CarDetails(BaseModel):
    """Input model for car details."""
    year: int = Field(..., ge=1990, le=2027, description="Vehicle year")
    manufacturer: str = Field(..., min_length=1, description="Vehicle manufacturer")
    model: str = Field(default="", description="Vehicle model")
    odometer: int = Field(..., ge=0, le=500000, description="Mileage in miles")
    condition: Optional[str] = Field(default=None, description="Vehicle condition")
    fuel: Optional[str] = Field(default=None, description="Fuel type")
    transmission: Optional[str] = Field(default=None, description="Transmission type")
    drive: Optional[str] = Field(default=None, description="Drive type")
    type: Optional[str] = Field(default=None, description="Vehicle type")
    paint_color: Optional[str] = Field(default=None, description="Paint color")
    state: Optional[str] = Field(default=None, description="State")
    cylinders: Optional[str] = Field(default=None, description="Number of cylinders")
    title_status: Optional[str] = Field(default="clean", description="Title status")
    
    @validator('manufacturer', 'model', pre=True)
    def lowercase_strings(cls, v):
        if isinstance(v, str):
            return v.lower().strip()
        return v


class FeatureImpact(BaseModel):
    """Feature impact on price."""
    feature: str
    effect: str
    impact_value: float
    direction: str  # 'positive' or 'negative'


class ComparableCar(BaseModel):
    """Comparable car listing with image and URL."""
    price: float
    year: int
    manufacturer: str
    model: str
    odometer: float
    condition: Optional[str] = None
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    drive: Optional[str] = None
    type: Optional[str] = None
    state: Optional[str] = None
    image_url: Optional[str] = None
    listing_url: Optional[str] = None
    similarity_score: float


class PriceRange(BaseModel):
    """Price range with low and high bounds."""
    low: float
    high: float


class PredictionResponse(BaseModel):
    """Response model for price prediction."""
    predicted_price: float
    price_range: PriceRange
    confidence_score: float
    feature_impacts: List[FeatureImpact]
    comparables: List[ComparableCar]
    percentile_vs_market: float
    price_label: str  # 'Fair Price', 'Underpriced', 'Overpriced'
    summary: str


# Global model storage
models = {}
config = {}
comparables_df = None
feature_importance = {}


def load_models():
    """Load all trained models and data."""
    global models, config, comparables_df, feature_importance
    
    print("Loading models...")
    
    # Load main model
    model_path = MODELS_DIR / "price_model.joblib"
    if model_path.exists():
        models['main'] = joblib.load(model_path)
        print(f"✅ Loaded main model")
    else:
        print(f"⚠️ Main model not found at {model_path}")
    
    # Load quantile models
    for name in ['low', 'median', 'high']:
        path = MODELS_DIR / f"quantile_{name}.joblib"
        if path.exists():
            models[f'quantile_{name}'] = joblib.load(path)
            print(f"✅ Loaded quantile_{name} model")
    
    # Load config
    config_path = MODELS_DIR / "model_config.json"
    if config_path.exists():
        with open(config_path) as f:
            config.update(json.load(f))
        print(f"✅ Loaded model config")
    
    # Load metrics/feature importance
    metrics_path = MODELS_DIR / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path) as f:
            metrics = json.load(f)
            feature_importance.update(metrics.get('feature_importance', {}))
        print(f"✅ Loaded feature importance")
    
    # Load comparables data
    comparables_path = MODELS_DIR / "comparables_data.parquet"
    if comparables_path.exists():
        comparables_df = pd.read_parquet(comparables_path)
        print(f"✅ Loaded {len(comparables_df):,} comparable listings")
    
    return models


@app.on_event("startup")
async def startup_event():
    """Load models on startup."""
    load_models()


def prepare_input(car: CarDetails) -> pd.DataFrame:
    """Prepare input data for prediction."""
    current_year = datetime.now().year
    
    data = {
        'year': car.year,
        'odometer': car.odometer,
        'manufacturer': car.manufacturer,
        'model': car.model if car.model else 'unknown',
        'condition': car.condition or 'unknown',
        'fuel': car.fuel or 'unknown',
        'transmission': car.transmission or 'unknown',
        'drive': car.drive or 'unknown',
        'type': car.type or 'unknown',
        'paint_color': car.paint_color or 'unknown',
        'state': car.state or 'unknown',
        'cylinders': car.cylinders or 'unknown',
        'title_status': car.title_status or 'clean',
        'car_age': current_year - car.year,
        'log_odometer': np.log1p(car.odometer)
    }
    
    return pd.DataFrame([data])


def find_comparables(car: CarDetails, n: int = 10) -> List[Dict]:
    """Find comparable cars from the dataset."""
    global comparables_df
    
    if comparables_df is None or len(comparables_df) == 0:
        return []
    
    df = comparables_df.copy()
    
    # Filter by make
    same_make = df[df['manufacturer'] == car.manufacturer]
    
    # If not enough, expand to similar
    if len(same_make) < n:
        similar = df
    else:
        similar = same_make
    
    # Filter by year range
    year_range = similar[(similar['year'] >= car.year - 2) & (similar['year'] <= car.year + 2)]
    
    if len(year_range) < 5:
        year_range = similar[(similar['year'] >= car.year - 4) & (similar['year'] <= car.year + 4)]
    
    if len(year_range) == 0:
        year_range = similar
    
    # Calculate similarity score
    year_range = year_range.copy()
    
    # Normalize for scoring
    year_diff = np.abs(year_range['year'] - car.year) / 10
    odo_diff = np.abs(year_range['odometer'].fillna(car.odometer) - car.odometer) / 100000
    
    # Same manufacturer bonus
    make_match = (year_range['manufacturer'] == car.manufacturer).astype(float) * 0.3
    
    # Same model bonus
    model_match = (year_range['model'].str.contains(car.model.split()[0] if car.model else '', case=False, na=False)).astype(float) * 0.2
    
    # Calculate similarity (higher is better)
    year_range['similarity_score'] = 1 - (year_diff * 0.3 + odo_diff * 0.2) + make_match + model_match
    year_range['similarity_score'] = year_range['similarity_score'].clip(0, 1)
    
    # Sort by similarity and get top N
    top_comparables = year_range.nlargest(n, 'similarity_score')
    
    results = []
    for _, row in top_comparables.iterrows():
        # Get image URL - use from dataset or generate placeholder
        image_url = row.get('image_url', None)
        if pd.isna(image_url) or not image_url or image_url == 'nan':
            # Placeholder image URL with car info
            image_url = None
        
        # Get listing URL
        listing_url = row.get('url', None)
        if pd.isna(listing_url) or not listing_url:
            listing_url = None
        
        results.append({
            'price': float(row['price']),
            'year': int(row['year']),
            'manufacturer': str(row['manufacturer']),
            'model': str(row.get('model', 'N/A')),
            'odometer': float(row.get('odometer', 0)),
            'condition': str(row.get('condition', 'N/A')) if pd.notna(row.get('condition')) else None,
            'transmission': str(row.get('transmission', 'N/A')) if pd.notna(row.get('transmission')) else None,
            'fuel': str(row.get('fuel', 'N/A')) if pd.notna(row.get('fuel')) else None,
            'drive': str(row.get('drive', 'N/A')) if pd.notna(row.get('drive')) else None,
            'type': str(row.get('type', 'N/A')) if pd.notna(row.get('type')) else None,
            'state': str(row.get('state', '')) if pd.notna(row.get('state')) else None,
            'image_url': str(image_url) if image_url and str(image_url) != 'nan' else None,
            'listing_url': str(listing_url) if listing_url and str(listing_url) != 'nan' else None,
            'similarity_score': float(row['similarity_score'])
        })
    
    return results


def calculate_feature_impacts(car: CarDetails, predicted_price: float) -> List[Dict]:
    """Calculate human-readable feature impacts on price."""
    impacts = []
    
    current_year = datetime.now().year
    car_age = current_year - car.year
    
    # Age impact
    if car_age <= 2:
        impacts.append({
            'feature': 'Vehicle Age',
            'effect': f'+${min(car_age * 500, 2000):,.0f}',
            'impact_value': min(car_age * 500, 2000),
            'direction': 'positive'
        })
    elif car_age <= 5:
        impacts.append({
            'feature': 'Vehicle Age',
            'effect': f'Near new ({car_age} years old)',
            'impact_value': 500,
            'direction': 'positive'
        })
    else:
        depreciation = min(car_age * 800, 15000)
        impacts.append({
            'feature': 'Vehicle Age',
            'effect': f'-${depreciation:,.0f}',
            'impact_value': -depreciation,
            'direction': 'negative'
        })
    
    # Mileage impact
    avg_miles_per_year = 12000
    expected_miles = car_age * avg_miles_per_year
    mile_diff = car.odometer - expected_miles
    
    if mile_diff < -20000:
        bonus = min(abs(mile_diff) * 0.03, 3000)
        impacts.append({
            'feature': 'Low Mileage',
            'effect': f'+${bonus:,.0f}',
            'impact_value': bonus,
            'direction': 'positive'
        })
    elif mile_diff > 30000:
        penalty = min(mile_diff * 0.02, 4000)
        impacts.append({
            'feature': 'High Mileage',
            'effect': f'-${penalty:,.0f}',
            'impact_value': -penalty,
            'direction': 'negative'
        })
    
    # Transmission impact
    if car.transmission == 'manual':
        impacts.append({
            'feature': 'Manual Transmission',
            'effect': '-$500',
            'impact_value': -500,
            'direction': 'negative'
        })
    
    # Drive type impact
    if car.drive == '4wd':
        impacts.append({
            'feature': '4WD/AWD',
            'effect': '+$2,500',
            'impact_value': 2500,
            'direction': 'positive'
        })
    
    # Fuel type impact
    if car.fuel == 'diesel':
        impacts.append({
            'feature': 'Diesel Engine',
            'effect': '+$1,500',
            'impact_value': 1500,
            'direction': 'positive'
        })
    elif car.fuel == 'electric':
        impacts.append({
            'feature': 'Electric Vehicle',
            'effect': '+$3,000',
            'impact_value': 3000,
            'direction': 'positive'
        })
    elif car.fuel == 'hybrid':
        impacts.append({
            'feature': 'Hybrid',
            'effect': '+$2,000',
            'impact_value': 2000,
            'direction': 'positive'
        })
    
    # Condition impact
    if car.condition == 'excellent':
        impacts.append({
            'feature': 'Excellent Condition',
            'effect': '+$2,000',
            'impact_value': 2000,
            'direction': 'positive'
        })
    elif car.condition == 'like new':
        impacts.append({
            'feature': 'Like New Condition',
            'effect': '+$3,000',
            'impact_value': 3000,
            'direction': 'positive'
        })
    elif car.condition == 'fair':
        impacts.append({
            'feature': 'Fair Condition',
            'effect': '-$1,500',
            'impact_value': -1500,
            'direction': 'negative'
        })
    elif car.condition == 'salvage':
        impacts.append({
            'feature': 'Salvage Title',
            'effect': '-$5,000',
            'impact_value': -5000,
            'direction': 'negative'
        })
    
    # Title status impact
    if car.title_status and car.title_status != 'clean':
        impacts.append({
            'feature': 'Non-Clean Title',
            'effect': '-$3,000',
            'impact_value': -3000,
            'direction': 'negative'
        })
    
    # Sort by absolute impact value
    impacts.sort(key=lambda x: abs(x['impact_value']), reverse=True)
    
    return impacts[:5]  # Return top 5


def calculate_market_percentile(predicted_price: float, comparables: List[Dict]) -> float:
    """Calculate where this price falls in the market."""
    if not comparables:
        return 50.0
    
    prices = [c['price'] for c in comparables]
    below_count = sum(1 for p in prices if p < predicted_price)
    percentile = (below_count / len(prices)) * 100
    
    return round(percentile, 1)


def get_price_label(predicted_price: float, comparables: List[Dict]) -> str:
    """Determine if the car is fairly priced, underpriced, or overpriced."""
    if not comparables:
        return "Fair Price"
    
    prices = [c['price'] for c in comparables]
    median_price = np.median(prices)
    
    diff_pct = (predicted_price - median_price) / median_price * 100
    
    if diff_pct < -10:
        return "Great Value"
    elif diff_pct < -5:
        return "Good Deal"
    elif diff_pct > 10:
        return "Above Market"
    elif diff_pct > 5:
        return "Slightly High"
    else:
        return "Fair Price"


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Fair Price Used Car Predictor API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "POST /predict",
            "health": "GET /health",
            "dropdowns": "GET /dropdowns"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "comparables_count": len(comparables_df) if comparables_df is not None else 0
    }


@app.get("/dropdowns")
async def get_dropdowns():
    """Get dropdown options for the form."""
    dropdowns_path = DATA_DIR / "dropdowns.json"
    
    if dropdowns_path.exists():
        with open(dropdowns_path) as f:
            return json.load(f)
    
    # Return defaults if file not found
    return {
        "manufacturers": ["ford", "toyota", "honda", "chevrolet", "nissan", "bmw", "mercedes-benz"],
        "fuels": ["gas", "diesel", "electric", "hybrid"],
        "transmissions": ["automatic", "manual"],
        "drives": ["fwd", "rwd", "4wd"],
        "types": ["sedan", "suv", "truck", "coupe", "wagon"],
        "conditions": ["new", "like new", "excellent", "good", "fair"],
        "years": list(range(1990, datetime.now().year + 2))
    }


def get_cache_key(car: CarDetails) -> str:
    """Generate a cache key for a prediction request."""
    key_data = f"{car.year}-{car.manufacturer}-{car.model}-{car.odometer}-{car.condition}-{car.fuel}-{car.transmission}-{car.drive}-{car.type}"
    return hashlib.md5(key_data.encode()).hexdigest()


@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: Request, car: CarDetails):
    """Predict the fair market price for a used car."""
    
    if 'main' not in models:
        logger.error("Prediction requested but model not loaded")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again later.")
    
    # Check cache first
    cache_key = get_cache_key(car)
    if cache_key in prediction_cache:
        cached = prediction_cache[cache_key]
        if time.time() - cached['timestamp'] < CACHE_TTL:
            logger.info(f"Cache hit for prediction: {cache_key[:8]}...")
            return PredictionResponse(**cached['result'])
    
    try:
        # Log prediction request (no PII)
        logger.info(f"Prediction request: {car.year} {car.manufacturer} {car.model}, {car.odometer} miles")
        
        # Prepare input
        input_df = prepare_input(car)
        
        # Get predictions (models predict log-transformed price)
        main_pred_log = models['main'].predict(input_df)[0]
        predicted_price = float(np.expm1(main_pred_log))
        
        # Get quantile predictions for confidence interval
        if 'quantile_low' in models and 'quantile_high' in models:
            low_pred_log = models['quantile_low'].predict(input_df)[0]
            high_pred_log = models['quantile_high'].predict(input_df)[0]
            price_low = float(np.expm1(low_pred_log))
            price_high = float(np.expm1(high_pred_log))
        else:
            # Fallback: estimate interval as ±15%
            price_low = predicted_price * 0.85
            price_high = predicted_price * 1.15
        
        # Ensure sensible bounds
        price_low = max(500, price_low)
        price_high = max(price_low + 500, price_high)
        predicted_price = max(price_low, min(price_high, predicted_price))
        
        # Calculate confidence score based on interval width
        interval_width = (price_high - price_low) / predicted_price
        confidence_score = max(0.5, min(0.95, 1 - interval_width))
        
        # Find comparable cars
        comparables = find_comparables(car, n=10)
        
        # Calculate feature impacts
        feature_impacts = calculate_feature_impacts(car, predicted_price)
        
        # Calculate market percentile
        percentile = calculate_market_percentile(predicted_price, comparables)
        
        # Get price label
        price_label = get_price_label(predicted_price, comparables)
        
        # Generate summary
        summary = f"Based on a {car.year} {car.manufacturer.title()}"
        if car.model:
            summary += f" {car.model.title()}"
        summary += f" with {car.odometer:,} miles, we estimate a fair market price of ${predicted_price:,.0f}. "
        summary += f"This vehicle is priced at the {percentile:.0f}th percentile compared to similar cars."
        
        result = {
            "predicted_price": round(predicted_price, -1),
            "price_range": {"low": round(price_low, -1), "high": round(price_high, -1)},
            "confidence_score": round(confidence_score, 2),
            "feature_impacts": feature_impacts,
            "comparables": comparables,
            "percentile_vs_market": percentile,
            "price_label": price_label,
            "summary": summary
        }
        
        # Cache the result
        prediction_cache[cache_key] = {
            'result': result,
            'timestamp': time.time()
        }
        
        # Clean old cache entries periodically (simple cleanup)
        if len(prediction_cache) > 10000:
            current_time = time.time()
            expired_keys = [k for k, v in prediction_cache.items() if current_time - v['timestamp'] > CACHE_TTL]
            for k in expired_keys[:1000]:
                del prediction_cache[k]
        
        return PredictionResponse(
            predicted_price=result["predicted_price"],
            price_range=PriceRange(**result["price_range"]),
            confidence_score=result["confidence_score"],
            feature_impacts=[FeatureImpact(**f) for f in feature_impacts],
            comparables=[ComparableCar(**c) for c in comparables],
            percentile_vs_market=percentile,
            price_label=price_label,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error internally, but don't expose to user
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed. Please check your inputs and try again.")


@app.get("/insights")
async def get_insights():
    """Get market insights data."""
    insights_path = DATA_DIR / "insights.json"
    
    if insights_path.exists():
        with open(insights_path) as f:
            return json.load(f)
    
    raise HTTPException(status_code=404, detail="Insights not found. Please run training first.")


@app.get("/metrics")
async def get_metrics():
    """Get model performance metrics."""
    metrics_path = MODELS_DIR / "metrics.json"
    
    if metrics_path.exists():
        with open(metrics_path) as f:
            return json.load(f)
    
    raise HTTPException(status_code=404, detail="Metrics not found. Please run training first.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
