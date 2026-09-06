#!/bin/bash
# Starts the Flask API on http://localhost:5000
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/backend"

if [ ! -f "venv/bin/activate" ]; then
  echo ""
  echo "Python virtual environment missing. Run ./setup-mac.sh or setting up venv now..."
  python3 -m venv venv
  ./venv/bin/pip install --upgrade pip
  ./venv/bin/pip install -r requirements.txt
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

source venv/bin/activate
echo "Starting the NEED backend on http://localhost:5000"
echo "Press Ctrl+C to stop it."
echo ""
python app.py
