#!/bin/bash
# Starts the React app on http://localhost:5173
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo ""
  echo "JavaScript packages are missing. Running npm install..."
  npm install
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

echo "Starting the NEED frontend on http://localhost:5173"
echo "Press Ctrl+C to stop it."
echo ""
npm run dev
