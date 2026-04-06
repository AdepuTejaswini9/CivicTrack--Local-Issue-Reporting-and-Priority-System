@echo off
REM ============================================================
REM  CivicTrack — One-Click Run (Windows)
REM  Double-click this file OR run: start.bat
REM ============================================================

echo.
echo  ==========================================================
echo    CivicTrack — Local Issue Reporting and Priority System
echo  ==========================================================
echo.

REM Check Python is installed
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo  ERROR: Python not found. Please install Python 3.10+
    echo  Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Install required packages (skips if already installed)
echo  Installing dependencies...
pip install flask werkzeug python-dotenv --quiet

echo.
echo  Starting server at http://127.0.0.1:5000
echo  Admin login: admin / admin123
echo  Press Ctrl+C to stop
echo.

REM Run from project root so imports work
python run.py

pause
