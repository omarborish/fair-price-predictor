@echo off
echo ========================================
echo Fair Price Predictor - Backend Server
echo ========================================
echo.

cd /d "%~dp0\.."

REM Check if venv exists
if not exist "venv" (
    echo ERROR: Virtual environment not found.
    echo Please run train_model.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate

REM Check if model exists
if not exist "server\models\price_model.joblib" (
    echo WARNING: Model not found. Please run train_model.bat first.
    echo The server will start but predictions will not work.
    echo.
)

REM Start server
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop
echo.

cd server
uvicorn main:app --reload --port 8000
