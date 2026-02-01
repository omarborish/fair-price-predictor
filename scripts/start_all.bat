@echo off
echo ========================================
echo Fair Price Predictor - Start All Services
echo ========================================
echo.

cd /d "%~dp0"

echo Starting backend server...
start "Backend" cmd /k "call start_backend.bat"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting frontend server...
start "Frontend" cmd /k "call start_frontend.bat"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close this window to continue...
pause
