#!/bin/bash

echo "========================================"
echo "Fair Price Predictor - Backend Server"
echo "========================================"
echo

cd "$(dirname "$0")/.."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found."
    echo "Please run train_model.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if model exists
if [ ! -f "server/models/price_model.joblib" ]; then
    echo "WARNING: Model not found. Please run train_model.sh first."
    echo "The server will start but predictions will not work."
    echo
fi

# Start server
echo "Starting FastAPI server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo

cd server
uvicorn main:app --reload --port 8000
