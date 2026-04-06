#!/usr/bin/env python3
# run.py — Zero-setup entry point
# ============================================================
# Just run:  python run.py
# No virtual environment needed.
# ============================================================

import sys
import subprocess

# ── Auto-install missing packages ──────────────────────────
REQUIRED = ['flask', 'werkzeug', 'python-dotenv']

def install_missing():
    """Install any missing packages automatically."""
    missing = []
    for pkg in REQUIRED:
        try:
            __import__(pkg.replace('-', '_').split('[')[0])
        except ImportError:
            missing.append(pkg)

    if missing:
        print(f"Installing missing packages: {', '.join(missing)} ...")
        # Try with --break-system-packages first (Linux/macOS system Python)
        result = subprocess.call([
            sys.executable, '-m', 'pip', 'install',
            '--quiet', '--break-system-packages', *missing
        ], stderr=subprocess.DEVNULL)
        # Fallback without the flag (Windows / older pip)
        if result != 0:
            subprocess.call([
                sys.executable, '-m', 'pip', 'install', '--quiet', *missing
            ])
        print("Dependencies ready ✅\n")

install_missing()

# ── Now import and start Flask ──────────────────────────────
from backend.app import create_app   # noqa: E402

app = create_app()

if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════╗
║     CivicTrack — Issue Reporting System      ║
║  Open browser: http://127.0.0.1:5000         ║
║  Admin login:  admin / admin123              ║
║  Press Ctrl+C to stop                        ║
╚══════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5000, debug=True)
