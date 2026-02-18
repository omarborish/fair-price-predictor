# Deploying the New FastAI Prediction Model

The live predictor uses the **FastAI Tabular** model only when the file `server/models/export.pkl` (and related config) is present on the server. If it’s missing, the API falls back to the legacy gradient-boosting blend. This guide explains how to train the model and get it into production.

---

## 1. Train the model locally

From the **repo root**:

```bash
python training/train_fastai.py
```

This will:

- Read `vehicles.csv` (or your configured data path).
- Train the FastAI Tabular learner and write artifacts into **`server/models/`**:
  - **`export.pkl`** — the main model file (required for FastAI predictions).
  - **`model_config.json`** — model type, cat/cont names, etc.
  - **`training_metrics.json`** — validation/test MAE, MAPE, within_10pct, etc.

The server’s `load_models()` in `server/main.py` looks for `export.pkl` in `server/models/`. If it finds it (and a valid `model_config.json`), it uses FastAI for `/predict`; otherwise it uses the legacy joblib models.

---

## 2. Get `export.pkl` onto production

Your backend is likely deployed on **Render** (or similar). The repo is deployed from Git, but **`export.pkl` is large** (often 50–150 MB) and is usually **not** committed as a normal file. You have a few options.

### Option A: Git LFS (recommended if you want the model in the repo)

1. **Install Git LFS** and enable it in the repo:
   ```bash
   git lfs install
   git lfs track "server/models/export.pkl"
   git add .gitattributes server/models/export.pkl
   git commit -m "Add FastAI export.pkl via LFS"
   git push
   ```
2. Ensure your host (e.g. Render) **supports Git LFS** and that the deploy step runs `git lfs pull` (or clones with LFS). On Render, add a build command that runs `git lfs pull` before starting the server if LFS isn’t pulled by default.

### Option B: Build step on the server (train on deploy)

- In Render (or your host), set the **build command** to run training before starting the API, e.g.:
  ```bash
  pip install -r requirements.txt && python training/train_fastai.py
  ```
- Then start the server as usual (e.g. `uvicorn server.main:app`).
- **Caveats:** Training needs enough RAM/CPU and `vehicles.csv` (or data) must be available in the deploy environment (e.g. downloaded from a URL or included in the repo). Build time will be long.

### Option C: External storage (S3, GCS, etc.)

1. After training locally, upload `export.pkl` (and optionally `model_config.json`, `training_metrics.json`) to a bucket (e.g. S3).
2. In your deploy or startup script, **download** those files into `server/models/` before the app starts (e.g. in a release phase or a small script that runs before `uvicorn`).
3. Ensure the running service has network and credentials to access the bucket.

### Option D: Manual upload (one-off or small teams)

- If your host allows **persistent disk** or “uploaded files”:
  1. Train locally so `server/models/export.pkl` exists.
  2. Upload `export.pkl` and `model_config.json` (and optionally `training_metrics.json`) into the same paths under the service’s `server/models/` directory.
- After the next deploy or restart, the server will load FastAI as long as those files are present.

---

## 3. Confirm the server is using FastAI

- **Health check:** Call `GET /health`. The response often includes a flag like `use_fastai: true` when the FastAI model is loaded.
- **Logs:** On startup, the server logs something like “Using FastAI tabular model for prediction” when `export.pkl` is loaded.
- **Behavior:** Predictions and metrics should match the numbers in `server/models/training_metrics.json` (e.g. lower MAE, higher within_10pct than the legacy blend).

---

## 4. Update the website metrics (optional but recommended)

The **How It Works** page reads metrics from **`web/public/data/metrics.json`**. After you train a new FastAI model:

1. Copy the new numbers from **`server/models/training_metrics.json`** (e.g. `validation.mae`, `validation.within_10pct`, `validation.within_15pct`, `model_type`, `training_samples`, `validation_samples`/`test_samples`, `trained_at`).
2. Update **`web/public/data/metrics.json`** to match (same shape as today: `mae`, `rmse`, `mape`, `within_5pct`, `within_10pct`, `within_15pct`, `within_20pct`, `within_25pct`, `interval_coverage`, `model_type`, `training_samples`, `test_samples`, `computed_at`, etc.). Use validation metrics for the main numbers; you can approximate `within_5pct`/`within_20pct`/`within_25pct` if not present.
3. Commit and deploy the front end so the “How It Works” page shows the latest FastAI metrics.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Run `python training/train_fastai.py` from repo root → produces `server/models/export.pkl` (+ config and metrics). |
| 2 | Get `export.pkl` (and `model_config.json`) onto the production server via Git LFS, build-step training, external storage, or manual upload. |
| 3 | Restart/redeploy the backend and verify with `/health` and logs that FastAI is loaded. |
| 4 | Optionally update `web/public/data/metrics.json` from `training_metrics.json` and redeploy the front end. |

Once `export.pkl` is present in `server/models/` on the running server, the API will use the new FastAI model for all `/predict` requests.
