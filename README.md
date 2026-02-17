# Fair Price Used Car Predictor

A production-ready, AI-powered web application that predicts fair market prices for used cars. Built with Next.js, FastAPI, and scikit-learn with advanced accuracy metrics.

![Fair Price Predictor](docs/screenshot.png)

## Features

- **AI Price Predictions**: Get accurate fair market value estimates using gradient boosting ML
- **High Accuracy**: Comprehensive metrics (within ±10%, ±15%, interval coverage)
- **Confidence Intervals**: See low/high price ranges using quantile regression
- **Explainability**: Understand what factors affect the price
- **Dependent Dropdowns**: Smart form (Make → Model → valid options) prevents invalid combinations
- **Similar Listings Gallery**: View comparable vehicles with photos, sorting, and original listing links
- **Market Insights Hub**: 5 in-depth analysis pages (mileage impact, depreciation, price distribution, drivetrain, fuel types)
- **Modern UI**: Responsive, dark mode, beautiful dashboard design
- **Ad-Ready**: Pre-built ad slot components for monetization
- **SEO Optimized**: Sitemap, meta tags, semantic HTML, fast loading

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| ML | FastAI Tabular (primary), scikit-learn / CatBoost blend (legacy fallback) |
| Model Storage | export.pkl (FastAI) or joblib (legacy) |

## Iteration Story

I built a full end-to-end product first: data → baseline model → API → UI. It worked, but accuracy and generalization weren’t where I wanted. I reviewed the pipeline and found a **legacy train/serve feature mismatch** (inference omitted `region` and `manufacturer_model`, so the server didn’t send the same features the preprocessor was fit on). I also wanted better handling of high-cardinality categoricals and consistent use of region. I moved toward **FastAI Tabular** (following Jeremy Howard’s practical approach): tabular embeddings for make/model/region, shared feature engineering between training and inference, and region + interaction features (`region_x_make`, `manufacturer_model`). I fixed the legacy path so both pipelines use the same feature engineering, added early stopping and regularization to FastAI training, and introduced R2 and validation/test metric reporting. I measured before/after and documented it below.

## Model Pipelines

- **Primary (production):** FastAI Tabular. Script: `training/train_fastai.py`. Artifacts: `server/models/export.pkl`, `server/models/model_config.json`, `server/models/training_metrics.json`. The server loads `export.pkl` at startup and uses it for `/predict` when present; preprocessing is identical to training via `server/feature_engineering.py`.
- **Legacy (fallback):** scikit-learn/CatBoost blend. Script: `training/train_model.py`. Artifacts: `server/models/price_model.joblib`, `server/models/preprocessor.joblib`, `server/models/model_q_low.joblib`, `server/models/model_q_high.joblib`, `server/models/training_metrics.json` (or `metrics.json`). Used only when FastAI artifacts are missing.
- **Feature engineering** is shared: `server/feature_engineering.py` (`ensure_region`, `add_engineered_features`). Both training scripts and inference (`prepare_input` / `prepare_input_fastai` in `server/main.py`) use it so train and serve stay aligned.

## Results

Baseline metrics (from repo metrics files; split: random, seed 42). After improvements, re-run training and update this table with the new numbers.

| Pipeline        | MAE    | RMSE   | MAPE  | Within ±10% | Within ±15% | R2   | Split  |
|-----------------|--------|--------|-------|-------------|-------------|------|--------|
| FastAI (before) | $3,264 | $6,318 | 32.4% | 41.0%       | 57.6%       | —    | random |
| Legacy (before) | $3,269 | $5,165 | 24.6% | 38.7%       | 52.1%       | —    | random |

*After running `python training/train_fastai.py` (with early stopping + R2), check `server/models/training_metrics.json` for `validation` and `test` metrics and add a row here.*

**Note:** `region_url` in the dataset is intentionally unused; only `region` (and state as fallback) is used for location.

## Project Structure

```
Fair Price Prediction/
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── insights/  # Insights hub + 5 sub-pages
│   │   │   ├── methodology/
│   │   │   ├── contact/
│   │   │   └── privacy/
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & API client
│   └── public/data/       # Static data (metrics, insights, dropdowns)
├── server/                 # FastAPI backend
│   ├── main.py            # API endpoints (loads export.pkl or legacy joblib)
│   ├── feature_engineering.py  # Shared features (region, interactions)
│   ├── models/            # Trained model artifacts (export.pkl, training_metrics.json, etc.)
│   ├── data/              # Generated lookup data
│   │   └── vehicle_options.json
│   ├── scripts/           # Data generation scripts
│   │   └── generate_vehicle_options.py
│   └── requirements.txt  # Python dependencies
├── training/               # ML training pipeline
│   ├── train_fastai.py    # FastAI Tabular (primary)
│   └── train_model.py     # Legacy blend (fallback)
├── docs/                   # Documentation
└── vehicles.csv           # Dataset (Craigslist cars & trucks)
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Train the Model

First, install Python dependencies and train the model. **Primary pipeline: FastAI Tabular.**

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r server/requirements.txt

# Train FastAI model (recommended; saves export.pkl + training_metrics.json)
python training/train_fastai.py
```

Optional — train legacy blend (scikit-learn/CatBoost) for fallback or comparison:

```bash
python training/train_model.py
```

Training will:
- Use shared feature engineering (`server/feature_engineering.py`: region, manufacturer_model, region_x_make, age/mileage interactions)
- Save artifacts to `server/models/` (FastAI: `export.pkl`, `model_config.json`, `training_metrics.json`; legacy: `price_model.joblib`, `preprocessor.joblib`, etc.)
- Report validation (and test) metrics including MAE, RMSE, MAPE, R2, within ±10%/±15%

### 2. Start the Backend

```bash
# From project root (with venv activated)
cd server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Endpoints:
- `POST /predict` - Get price prediction with comparables
- `GET /dropdowns` - Get form options
- `GET /insights` - Get market insights
- `GET /metrics` - Get model performance metrics
- `GET /health` - Health check
- `GET /options/makes` - Get all makes (for dependent dropdowns)
- `GET /options/models?make=Toyota` - Get models for a make
- `GET /options/details?make=Toyota&model=Camry` - Get valid options for make+model

### 3. Start the Frontend

```bash
# In a new terminal
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Create `.env.local` in the `web/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, set this to your API server URL.

### Google AdSense Integration

Ad placeholders are already in place. To enable real ads:

1. Get your AdSense publisher ID from Google AdSense
2. Update `src/components/AdSlot.tsx` with your credentials:

```tsx
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
  data-full-width-responsive="true">
</ins>
```

3. Add the AdSense script to `src/app/layout.tsx`:

```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
/>
```

Ad positions available:
- `header` - Top banner
- `sidebar` - Desktop sidebar
- `in-content` - Between content sections
- `footer` - Footer banner

## Data Regeneration

### Regenerate Vehicle Options (Dependent Dropdowns)

The vehicle options file powers the dependent dropdowns (Make → Model → Options):

```bash
# From project root (with venv activated)
python server/scripts/generate_vehicle_options.py
```

This generates `server/data/vehicle_options.json` containing:
- All makes sorted by popularity
- Models for each make
- Valid fuel/type/drive/transmission options per make+model
- Most common defaults for auto-fill

### Regenerate Insights

Insights are generated as part of the training process:

```bash
python training/train_model.py
```

This creates `web/public/data/insights.json` with:
- Price by year, manufacturer, mileage, fuel, drive, type
- Depreciation curve
- Overall market statistics

### When to Regenerate

- **After updating the dataset**: Re-run both scripts
- **After changing filtering thresholds**: Modify constants in scripts and re-run
- **Before production deployment**: Ensure all data files are up to date

## Model Details

### Features Used

**Numeric:**
- Year
- Odometer (mileage)
- Car age (computed)
- Log-transformed odometer

**Categorical:**
- Manufacturer (top 50, rest grouped as 'other')
- Model (top 300, rest grouped as 'other_model')
- Condition
- Cylinders
- Fuel type
- Title status
- Transmission
- Drive type
- Vehicle type
- Paint color
- State

### Model Performance

After training, you'll see comprehensive metrics:

| Metric | Description |
|--------|-------------|
| Within ±10% | % of predictions within 10% of actual price |
| Within ±15% | % of predictions within 15% of actual price |
| Interval Coverage | % of actual prices within p10-p90 range |
| MAE | Mean Absolute Error in dollars |
| RMSE | Root Mean Square Error |
| MAPE | Mean Absolute Percentage Error |

### Prediction Intervals

We use quantile regression to provide:
- **10th percentile**: Conservative/low estimate
- **50th percentile**: Fair price (main prediction)
- **90th percentile**: High estimate

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Price predictor form and results |
| `/insights` | Market trends and analysis |
| `/methodology` | How the model works (with live metrics) |
| `/contact` | Contact info and credits |
| `/privacy` | Privacy policy and terms |

## Deployment

### Backend (FastAPI)

Deploy to any Python hosting:
- Railway
- Render
- Google Cloud Run
- AWS Lambda + API Gateway
- DigitalOcean App Platform

Example Dockerfile:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt .
RUN pip install -r requirements.txt
COPY server/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Next.js)

Deploy to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Cloudflare Pages

```bash
cd web
npm run build
npm start
```

## API Reference

### POST /predict

Predict fair price for a vehicle.

**Request:**
```json
{
  "year": 2020,
  "manufacturer": "toyota",
  "model": "camry",
  "odometer": 45000,
  "condition": "good",
  "fuel": "gas",
  "transmission": "automatic",
  "drive": "fwd",
  "type": "sedan"
}
```

**Response:**
```json
{
  "predicted_price": 22500,
  "price_range": {
    "low": 19800,
    "high": 25200
  },
  "confidence_score": 0.85,
  "feature_impacts": [
    {
      "feature": "Low Mileage",
      "effect": "+$1,200",
      "impact_value": 1200,
      "direction": "positive"
    }
  ],
  "comparables": [
    {
      "price": 21500,
      "year": 2019,
      "manufacturer": "toyota",
      "model": "camry",
      "odometer": 52000,
      "condition": "good",
      "state": "CA",
      "image_url": "https://...",
      "listing_url": "https://...",
      "similarity_score": 0.92
    }
  ],
  "percentile_vs_market": 65.5,
  "price_label": "Fair Price",
  "summary": "Based on a 2020 Toyota Camry with 45,000 miles..."
}
```

## Dataset Attribution

This project uses the [Craigslist Cars and Trucks Dataset](https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data) by Austin Reese, available on Kaggle.

## Author

Built by **Engineer Omar Borish**

- LinkedIn: [omar-borish-9a75a1249](https://www.linkedin.com/in/omar-borish-9a75a1249/)
- GitHub: [omarborish](https://github.com/omarborish)
- Email: omarborish2004@gmail.com

## License

MIT License - see LICENSE file for details.

## Disclaimer

Price estimates are for informational purposes only and should not be considered as professional appraisals or financial advice. Actual market prices may vary based on factors not captured by our model.
