"""
Download model files into server/models/ from a URL (e.g. S3, GCS, or a zip).
Used on Render (or any host) so the backend can load FastAI/CatBoost without
storing large binaries in Git.

Set one of:
  MODEL_DOWNLOAD_BASE_URL  — base URL (with trailing slash); downloads known filenames.
  MODEL_DOWNLOAD_ZIP       — single URL to a .zip; extracts into server/models/.

Example (Render env):
  MODEL_DOWNLOAD_BASE_URL=https://my-bucket.s3.amazonaws.com/models/
  (files: export.pkl, model_config.json, training_metrics.json, catboost.cbm, etc.)

Run from repo root: python server/scripts/download_models.py
"""

import io
import os
import sys
import zipfile
from pathlib import Path
from urllib.request import urlopen, Request

# From repo root, models go in server/models/
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = REPO_ROOT / "server" / "models"

# Filenames we may download (server expects these)
MODEL_FILES = [
    "export.pkl",
    "model_config.json",
    "training_metrics.json",
    "catboost.cbm",
    "catboost_config.json",
    "ensemble_config.json",
    "conformal.json",
]


def download_one(url: str, dest: Path) -> bool:
    try:
        req = Request(url, headers={"User-Agent": "FairPrice-Render/1.0"})
        with urlopen(req, timeout=120) as r:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(r.read())
        print(f"  OK {dest.name}")
        return True
    except Exception as e:
        print(f"  SKIP {dest.name}: {e}")
        return False


def download_from_base(base_url: str) -> int:
    base = base_url.rstrip("/") + "/"
    count = 0
    for name in MODEL_FILES:
        if download_one(base + name, MODELS_DIR / name):
            count += 1
    return count


def download_zip(zip_url: str) -> int:
    print(f"Downloading zip from {zip_url[:60]}...")
    req = Request(zip_url, headers={"User-Agent": "FairPrice-Render/1.0"})
    with urlopen(req, timeout=300) as r:
        data = r.read()
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(data), "r") as zf:
        zf.extractall(MODELS_DIR)
        extracted = [n for n in zf.namelist() if not n.endswith("/") and ".." not in n]
    for n in extracted:
        print(f"  OK {Path(n).name}")
    return len(extracted)


def main() -> int:
    base = os.environ.get("MODEL_DOWNLOAD_BASE_URL")
    zip_url = os.environ.get("MODEL_DOWNLOAD_ZIP")

    if base:
        print(f"Downloading models from base URL: {base}")
        n = download_from_base(base)
        print(f"Downloaded {n} file(s) to {MODELS_DIR}")
        return 0 if n > 0 else 1
    if zip_url:
        n = download_zip(zip_url)
        print(f"Extracted {n} file(s) to {MODELS_DIR}")
        return 0 if n > 0 else 1

    print("No MODEL_DOWNLOAD_BASE_URL or MODEL_DOWNLOAD_ZIP set; skipping model download.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
