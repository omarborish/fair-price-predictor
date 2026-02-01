@echo off
echo ========================================
echo Fair Price Predictor - Model Training
echo ========================================
echo.

cd /d "%~dp0\.."

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r server\requirements.txt

REM Run training
echo.
echo Starting model training...
echo.
python training\train_model.py

echo.
echo ========================================
echo Training complete!
echo ========================================
pause
