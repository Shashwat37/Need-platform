#!/bin/bash
# ============================================================
#  NEED Platform — start the whole app.
#  Starts both backend and frontend servers.
# ============================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "Starting NEED Backend on http://localhost:5000..."
"$DIR/run-backend.sh" &
BACKEND_PID=$!

# Wait briefly for Flask to bind port 5000
sleep 3

echo "Starting NEED Frontend on http://localhost:5173..."
"$DIR/run-frontend.sh" &
FRONTEND_PID=$!

echo ""
echo "Both services are running!"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both."

cleanup() {
  echo ""
  echo "Shutting down NEED services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM
wait
