#!/bin/bash

echo "========================================"
echo "Fair Price Predictor - Model Training"
echo "========================================"
echo

cd "$(dirname "$0")/.."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r server/requirements.txt

# Run training
echo
echo "Starting model training..."
echo
python training/train_model.py

echo
echo "========================================"
echo "Training complete!"
echo "========================================"
