@echo off
echo ========================================
echo Fair Price Predictor - Frontend Server
echo ========================================
echo.

cd /d "%~dp0\..\web"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Start development server
echo Starting Next.js development server on http://localhost:3000
echo Press Ctrl+C to stop
echo.

call npm run dev
