# Step-by-step: Deploy the model on your existing Render backend

You already have the backend on Render. You are **not** training again. Follow these steps so Render downloads the model at build time and serves it.

---

## One-time: Get a URL for your model files

You need the contents of **`server/models/`** (from a past training) available at a URL. Pick one way:

### Option 1 — Zip and use a file host (easiest, no AWS account)

1. On your computer, zip the model folder:
   - **Windows (PowerShell):**  
     `Compress-Archive -Path "server\models\*" -DestinationPath "models.zip"`
   - **Mac/Linux:**  
     `cd server/models && zip -r ../../models.zip . && cd ../..`
2. Upload **models.zip** to any host that gives you a **direct download URL**, for example:
   - [Google Drive](https://drive.google.com): upload → Right‑click file → Get link → set “Anyone with the link” → use a “direct” link (e.g. from [this generator](https://sites.google.com/site/gdocs2direct/) or similar).
   - [Dropbox](https://dropbox.com): upload → Share → copy link → change `?dl=0` to `?dl=1` so it’s a direct download.
   - [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository): create a release, attach **models.zip**, copy the “Asset” download URL.
3. Copy that URL — you’ll paste it in Render (Step 4 below). Example:  
   `https://github.com/yourname/your-repo/releases/download/v1.0/models.zip`

### Option 2 — AWS S3 (if you use S3)

1. Create a bucket (or use an existing one).
2. Upload these files into a folder, e.g. `models/`:
   - `export.pkl`
   - `model_config.json`
   - `training_metrics.json`
   - (optional) `catboost.cbm`, `catboost_config.json`, `ensemble_config.json`
3. Either:
   - **Base URL:** Note the folder URL, e.g. `https://your-bucket.s3.region.amazonaws.com/models/` (trailing slash). You’ll set **MODEL_DOWNLOAD_BASE_URL** in Render.
   - **Zip:** Zip those files, upload the zip, make it public or use a signed URL, and set **MODEL_DOWNLOAD_ZIP** in Render.

---

## Steps on Render (do these in order)

### Step 1 — Open your backend service

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click your **backend Web Service** (the Fair Price API).

### Step 2 — Environment tab

1. Click **Environment** in the left sidebar.
2. Click **Add Environment Variable**.
3. Add **one** of these (depending on how you hosted the model):

   **If you have a single zip URL (Option 1 or S3 zip):**

   | Key | Value |
   |----|--------|
   | `MODEL_DOWNLOAD_ZIP` | Your direct download URL, e.g. `https://.../models.zip` |

   **If you have an S3 (or similar) folder URL (Option 2 base URL):**

   | Key | Value |
   |----|--------|
   | `MODEL_DOWNLOAD_BASE_URL` | `https://your-bucket.s3.region.amazonaws.com/models/` (must end with `/`) |

4. (Optional) Add:
   - `ENVIRONMENT` = `production`
5. Click **Save Changes**.

### Step 3 — Root Directory (check this first)

1. In **Settings**, find **Root Directory**.
2. **If it is set to `server`** (or any folder): the build runs *inside* that folder, so paths must not start with `server/`. Use the **Build** and **Start** commands from the “Root = server” row below.
3. **If it is empty** (repo root): use the “Root = repo root” row.

### Step 4 — Build Command

1. In **Settings**, find **Build Command**.
2. Set it to **one** of these:

   **If Root Directory is `server`** (your case — use this):
   ```bash
   pip install -r requirements.txt && pip install fastai catboost && python scripts/download_models.py
   ```

   **If Root Directory is empty** (repo root):
   ```bash
   pip install -r server/requirements.txt && pip install fastai catboost && python server/scripts/download_models.py
   ```
3. Click **Save Changes**.

### Step 5 — Start Command

1. In **Settings**, find **Start Command**.
2. Use the one that matches your Root Directory:

   **If Root Directory is `server`:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

   **If Root Directory is empty:**
   ```bash
   cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Click **Save Changes**.

### Step 6 — Deploy

1. Go to **Manual Deploy** (top right) → **Deploy latest commit** (or push a commit to trigger a deploy).
2. Wait for the build to finish (build logs will show `OK export.pkl` etc. if the download worked).
3. When the service is **Live**, open:
   - `https://<your-service-name>.onrender.com/health`  
   You should see something like: `"use_fastai": true`.
   - `https://<your-service-name>.onrender.com/model_info`  
   You should see model type and metrics.

---

## If something goes wrong

- **Build fails: "Could not open requirements file: ... server/requirements.txt"**  
  Your **Root Directory** is set to `server`, so the build runs inside that folder. Use the **Build Command** for Root = server:  
  `pip install -r requirements.txt && pip install fastai catboost && python scripts/download_models.py`  
  (no `server/` in the paths.)

- **Build fails: "can't open file '.../server/scripts/download_models.py': No such file or directory"**  
  The script isn’t in the repo Render is building. Commit and push it:  
  `git add server/scripts/download_models.py` then `git commit -m "Add model download script for Render"` and `git push`. Then redeploy.

- **Build fails on `download_models.py`** (e.g. download error)  
  Check that the URL is correct and that the zip is publicly downloadable (or use a signed URL). In Logs, look for the exact error (e.g. 403, 404).

- **`/health` shows `use_fastai: false`**  
  The model didn’t load. In **Logs**, look for “Loaded FastAI export.pkl” or any Python traceback. Confirm the build log showed `OK export.pkl`; if not, the download failed (wrong URL or permissions).

- **You don’t have the model files anymore**  
  You’ll need to train once (locally or elsewhere) to get `server/models/export.pkl` (and related files) again, then zip/upload and follow the steps above.

---

## Quick checklist

| # | What to do |
|---|------------|
| 1 | Zip `server/models/` and upload to Google Drive, Dropbox, GitHub Release, or S3. Copy the **direct** URL. |
| 2 | Render → your service → **Environment** → add `MODEL_DOWNLOAD_ZIP` (or `MODEL_DOWNLOAD_BASE_URL`) = that URL. |
| 3 | **Root Directory** = `server`? Use build: `pip install -r requirements.txt && pip install fastai catboost && python scripts/download_models.py` and start: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Empty root? Use paths with `server/` and start: `cd server && uvicorn ...`. |
| 4 | **Deploy** → check `/health` and `/model_info`. |
