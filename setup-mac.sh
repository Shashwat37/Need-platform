#!/bin/bash
# ============================================================
#  NEED Platform — one-time setup for macOS / Linux.
# ============================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo ""
echo "===== NEED Platform Setup (macOS / Linux) ====="
echo ""

cd "$DIR/backend"
echo "[1/5] Creating the Python virtual environment..."
python3 -m venv venv

echo "[2/5] Installing Python packages..."
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

echo "[3/5] Creating backend .env file..."
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

echo "[4/5] Filling database with demo data..."
./venv/bin/python seed.py

echo "[5/5] Installing frontend packages..."
cd "$DIR/frontend"
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi
npm install

echo ""
echo "===== Setup Finished ====="
echo "You can now run ./start-demo.sh to start both backend & frontend."
echo ""
