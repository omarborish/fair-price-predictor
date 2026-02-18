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
import re
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


def _google_drive_direct_url(url: str) -> str:
    """Convert a Google Drive share link to a direct download URL."""
    # /file/d/FILE_ID/view or /open?id=FILE_ID -> uc?export=download&id=FILE_ID
    m = re.search(r"/file/d/([a-zA-Z0-9_-]+)", url)
    if not m:
        m = re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    if m:
        return f"https://drive.google.com/uc?export=download&id={m.group(1)}"
    return url


def download_zip(zip_url: str) -> int:
    if "drive.google.com" in zip_url and "/uc?export=download" not in zip_url:
        zip_url = _google_drive_direct_url(zip_url)
        print(f"Using Google Drive direct download URL")
    print(f"Downloading zip from {zip_url[:60]}...")
    req = Request(zip_url, headers={"User-Agent": "FairPrice-Render/1.0"})
    with urlopen(req, timeout=300) as r:
        data = r.read()
    # Google Drive folder links (and some share pages) return HTML, not the zip
    if data[:500].strip().lower().startswith(b"<!") or b"<html" in data[:2000].lower():
        print("ERROR: The URL returned HTML instead of a zip file.")
        print("  - Do NOT use a Google Drive *folder* link.")
        print("  - Use a direct link to models.zip: open the file, Share, copy link, then use that URL (or https://drive.google.com/uc?export=download&id=FILE_ID).")
        sys.exit(1)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(io.BytesIO(data), "r") as zf:
            zf.extractall(MODELS_DIR)
            extracted = [n for n in zf.namelist() if not n.endswith("/") and ".." not in n]
    except zipfile.BadZipFile:
        print("ERROR: Downloaded file is not a valid zip.")
        print("  - Use a *direct* download URL to models.zip (e.g. Google Drive: Share models.zip → copy link; use that file link, not the folder link).")
        sys.exit(1)
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
