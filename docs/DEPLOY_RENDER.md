# Deploy the Backend on Render

This guide walks you through deploying the **FastAPI backend** (Fair Price Predictor API) on [Render](https://render.com) as a **Web Service**.

---

## Modify your existing Render backend to deploy the model

If you **already have** the backend on Render and want to start serving the FastAI/CatBoost model (instead of the legacy fallback), do one of the following.

### Option A: Download models during build (recommended)

1. **Upload your model files** somewhere reachable by URL:
   - **S3:** Upload `export.pkl`, `model_config.json`, `training_metrics.json` (and optionally `catboost.cbm`, `catboost_config.json`, `ensemble_config.json`) to a bucket. Use a **base URL** like `https://your-bucket.s3.region.amazonaws.com/models/` (with trailing slash), or make a **single .zip** of those files and upload it.
   - **Other:** Any public or signed URL that returns the file (e.g. Google Cloud Storage, Dropbox “direct link”, etc.).

2. **In Render Dashboard** → your **Web Service** → **Environment**:
   - Add one of:
     - **`MODEL_DOWNLOAD_BASE_URL`** = `https://your-bucket.s3.../models/`  
       (script will fetch `export.pkl`, `model_config.json`, etc. from that base)
     - **`MODEL_DOWNLOAD_ZIP`** = `https://.../models.zip`  
       (script will download the zip and extract into `server/models/`)

3. **Build Command** (run from repo root): run the download script **after** `pip install` so models are present before the server starts. Example:
   ```bash
   pip install -r server/requirements.txt && pip install fastai catboost && python server/scripts/download_models.py
   ```
   If you use a **Start Command** that already does `cd server && uvicorn ...`, leave it as is. The build step will have populated `server/models/`.

4. **Redeploy.** After deploy, check **Logs** for lines like `OK export.pkl` and `Loaded FastAI export.pkl`, and call `GET /health` — you should see `"use_fastai": true` (and `/model_info` for ensemble details).

### Option B: Git LFS (model in repo)

1. **Locally:** Install Git LFS, track the large files, commit and push:
   ```bash
   git lfs install
   git lfs track "server/models/export.pkl" "server/models/catboost.cbm"
   git add .gitattributes server/models/export.pkl server/models/model_config.json server/models/training_metrics.json
   # add catboost.cbm, catboost_config.json, ensemble_config.json if you use the blend
   git commit -m "Add production models via LFS"
   git push
   ```
2. **Render Build Command:** Ensure LFS files are pulled. Render does not always run `git lfs pull` by default. Use:
   ```bash
   git lfs pull && pip install -r server/requirements.txt && pip install fastai catboost
   ```
3. **Redeploy.** The service will have `server/models/` with the LFS files.

### Option C: Train on deploy (slow, not recommended)

Only if you have `vehicles.csv` (or data URL) in the deploy environment and can afford long build times:

- **Build Command:**  
  `pip install -r server/requirements.txt && pip install fastai catboost && python training/train_fastai.py`  
  (and optionally run CatBoost training). Then start the server as usual. See [DEPLOY_FASTAI_MODEL.md](DEPLOY_FASTAI_MODEL.md) for caveats.

---

## 1. Prepare the repo (new service)

- Commit and push your code to GitHub (or GitLab).
- **Model files:** The API needs `server/models/export.pkl` (and optionally `catboost.cbm`, configs). These are large and usually not in Git. See [Deploying the New FastAI Model](DEPLOY_FASTAI_MODEL.md) for options: **Git LFS**, **build-step download**, or **external storage**. If you skip this, the API will still start and fall back to the legacy scikit-learn pipeline when FastAI/CatBoost artifacts are missing.

---

## 2. Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your repo (GitHub/GitLab) and select the **Fair Price Prediction** repository.
3. Use the settings below.

### Suggested settings (Native Python)

| Field | Value |
|--------|--------|
| **Name** | `fair-price-api` (or any name) |
| **Region** | Choose closest to your users |
| **Root Directory** | *(leave empty — repo root)* |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r server/requirements.txt` |
| **Start Command** | `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT` |

If you use **FastAI + CatBoost** in production, ensure they are installed:

- Either add to `server/requirements.txt`: `fastai`, `catboost` (and optionally `torch` if not already there).
- Or use a **build command** that installs them, e.g.:
  ```bash
  pip install -r server/requirements.txt && pip install fastai catboost
  ```

### Environment variables (optional)

- **`ENVIRONMENT`** = `production` — so the server runs in production mode.
- **`PYTHON_VERSION`** = `3.11` — if you want to pin the Python version on Render.

No database or Redis is required for the basic API; rate limiting is in-memory (single instance).

---

## 3. Using a Dockerfile (alternative)

If you prefer **Docker** on Render:

1. In the repo root, create a **Dockerfile** (e.g. the one in README):
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY server/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY server/ .
   ENV PORT=8000
   EXPOSE 8000
   CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
   ```
2. On Render: **New** → **Web Service** → select repo → set **Environment** to **Docker**. Render will use the Dockerfile and inject `PORT`; the start command above uses it.

Model files must still be present inside the image (e.g. copied from a build stage that downloads them, or via Git LFS in the repo and `COPY server/`).

---

## 4. Get model files onto the service

- **Without model files:** The app starts and uses the **legacy** pipeline (`price_model.joblib`, etc.) if present; otherwise predictions may fail until you add models.
- **With FastAI/CatBoost:** Put `export.pkl`, `model_config.json`, and (if using blend) `catboost.cbm`, `catboost_config.json`, `ensemble_config.json` into `server/models/` before or at startup. See [DEPLOY_FASTAI_MODEL.md](DEPLOY_FASTAI_MODEL.md) for **Git LFS**, **download in build/start**, or **external storage**.

---

## 5. Deploy and verify

1. Click **Create Web Service**. Render will build and deploy.
2. After deploy, open: `https://<your-service-name>.onrender.com/health`
   - You should see JSON with `"status":"ok"` and, if FastAI/CatBoost loaded, `"use_fastai": true` (and ensemble info in `/model_info`).
3. Test a prediction:
   ```bash
   curl -X POST https://<your-service-name>.onrender.com/predict \
     -H "Content-Type: application/json" \
     -d '{"year":2020,"manufacturer":"toyota","model":"camry","odometer":45000,"condition":"good","fuel":"gas","transmission":"automatic","drive":"fwd","type":"sedan"}'
   ```

---

## 6. Point the frontend at the API

In your **Next.js** app (e.g. on Vercel), set:

```env
NEXT_PUBLIC_API_URL=https://<your-service-name>.onrender.com
```

Redeploy the frontend so it uses the Render backend.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push repo; decide how to provide `server/models/` (LFS, download, or S3). |
| 2 | Render → New Web Service → connect repo, Python runtime, build/start commands above. |
| 3 | Add `ENVIRONMENT=production` (and optional `PYTHON_VERSION=3.11`). |
| 4 | Deploy; check `/health` and `/model_info`; test `/predict`. |
| 5 | Set `NEXT_PUBLIC_API_URL` in the frontend and redeploy. |

For model artifacts and training, see [DEPLOY_FASTAI_MODEL.md](DEPLOY_FASTAI_MODEL.md).
