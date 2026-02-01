#!/bin/bash

echo "========================================"
echo "Fair Price Predictor - Frontend Server"
echo "========================================"
echo

cd "$(dirname "$0")/../web"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start development server
echo "Starting Next.js development server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo

npm run dev
