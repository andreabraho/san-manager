#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== San Manager ==="

# Install dependencies if node_modules is missing
if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  (cd "$ROOT/backend" && npm install)
fi

if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT/frontend" && npm install)
fi

echo ""
echo "Starting servers..."

# Start backend
(cd "$ROOT/backend" && npm run dev) &
BACKEND_PID=$!

# Start frontend
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
