#!/bin/bash
# ============================================================
#  CivicTrack — One-Click Run (macOS / Linux)
#  Usage:  bash start.sh
# ============================================================

echo ""
echo " =========================================="
echo "   CivicTrack - Issue Reporting System"
echo " =========================================="
echo ""

# Check Python is available (try python3 first, then python)
if command -v python3 &>/dev/null; then
    PY=python3
    PIP=pip3
elif command -v python &>/dev/null; then
    PY=python
    PIP=pip
else
    echo " ERROR: Python not found. Install Python 3.10+ first."
    exit 1
fi

echo " Python found: $($PY --version)"
echo ""

# Install required packages quietly (skips if already installed)
echo " Checking / installing dependencies..."
$PIP install flask werkzeug python-dotenv --quiet --break-system-packages 2>/dev/null \
  || $PIP install flask werkzeug python-dotenv --quiet

echo " Dependencies ready ✅"
echo ""
echo " Starting server at http://127.0.0.1:5000"
echo " Admin login: admin / admin123"
echo " Press Ctrl+C to stop"
echo ""

# Run from project root
$PY run.py
