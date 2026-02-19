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
from http.cookiejar import CookieJar
from pathlib import Path
from urllib.request import Request, build_opener, urlopen
from urllib.request import HTTPCookieProcessor

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


def _fetch_google_drive_file(url: str, timeout: int = 300) -> bytes:
    """Download from Google Drive; handle virus-scan confirmation page for large files."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0"}
    jar = CookieJar()
    opener = build_opener(HTTPCookieProcessor(jar))
    req = Request(url, headers=headers)
    r = opener.open(req, timeout=timeout)
    data = r.read()
    r.close()
    # Large files: Drive returns HTML "can't scan for viruses" page
    if data[:500].strip().lower().startswith(b"<!") or b"<html" in data[:4000].lower():
        html = data.decode("utf-8", errors="ignore")
        # Try 1: Many sources say confirm=t bypasses the virus-scan (no parsing needed)
        url_with_t = url + ("&" if "?" in url else "?") + "confirm=t"
        print("  Drive virus-scan page detected, retrying with confirm=t...")
        req2 = Request(url_with_t, headers=headers)
        r2 = opener.open(req2, timeout=timeout)
        data = r2.read()
        r2.close()
        if data[:500].strip().lower().startswith(b"<!") or b"<html" in data[:2000].lower():
            # Try 2: Extract actual token from the first HTML response
            confirm_m = re.search(r"confirm=([a-zA-Z0-9_-]+)", html)
            if confirm_m:
                token = confirm_m.group(1)
                if token != "t":
                    url_confirm = url + ("&" if "?" in url else "?") + "confirm=" + token
                    print("  Retrying with confirm token from page...")
                    req3 = Request(url_confirm, headers=headers)
                    r3 = opener.open(req3, timeout=timeout)
                    data = r3.read()
                    r3.close()
        if data[:500].strip().lower().startswith(b"<!") or b"<html" in data[:2000].lower():
            print("ERROR: Google Drive still returned HTML. Try GitHub Release or Dropbox for the zip.")
            sys.exit(1)
        return data
    return data


def download_zip(zip_url: str) -> int:
    if "drive.google.com" in zip_url and "/uc?export=download" not in zip_url:
        zip_url = _google_drive_direct_url(zip_url)
        print("Using Google Drive direct download URL")
    print(f"Downloading zip from {zip_url[:60]}...")
    if "drive.google.com" in zip_url:
        data = _fetch_google_drive_file(zip_url)
    else:
        req = Request(zip_url, headers={"User-Agent": "FairPrice-Render/1.0"})
        with urlopen(req, timeout=300) as r:
            data = r.read()
        if data[:500].strip().lower().startswith(b"<!") or b"<html" in data[:2000].lower():
            print("ERROR: The URL returned HTML instead of a zip file. Use a direct download link.")
            sys.exit(1)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(io.BytesIO(data), "r") as zf:
            zf.extractall(MODELS_DIR)
            extracted = [n for n in zf.namelist() if not n.endswith("/") and ".." not in n]
    except zipfile.BadZipFile:
        print("ERROR: Downloaded file is not a valid zip.")
        print("  - Use a *direct* download URL to models.zip. For Google Drive large files, the script will try the virus-scan bypass.")
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
