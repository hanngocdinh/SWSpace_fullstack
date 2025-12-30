@echo off
REM Start AI Human Detection for All 3 Floors
REM Windows batch script

echo ========================================
echo Starting AI Human Detection - All Floors
echo ========================================

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if virtual environment exists
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
)

REM Set backend URL (change if needed)
if not defined SWS_BACKEND set SWS_BACKEND=http://localhost:5000

echo Backend URL: %SWS_BACKEND%
echo.

REM Run the launcher
python run_all_floors.py

echo.
echo ========================================
echo All processes stopped
echo ========================================
pause
