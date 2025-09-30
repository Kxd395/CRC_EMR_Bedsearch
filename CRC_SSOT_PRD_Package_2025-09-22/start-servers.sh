#!/bin/bash

# Start EMR servers
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

echo "🚀 Starting EMR Servers..."

# Kill any existing processes
pkill -9 -f "src/api/server.js" 2>/dev/null
pkill -9 -f "vite.*5174" 2>/dev/null
sleep 1

# Start API server
echo "Starting API server..."
node src/api/server.js > logs/api-server.log 2>&1 &
API_PID=$!
sleep 2

# Start UI server
echo "Starting UI server..."
cd src/web
npm run dev -- --port 5174 > ../../logs/ui-server.log 2>&1 &
UI_PID=$!
cd ../..

sleep 3

# Check if servers are running
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "✅ API Server running on port 3001"
else
  echo "❌ API Server failed to start"
fi

if lsof -ti:5174 > /dev/null 2>&1; then
  echo "✅ UI Server running on port 5174"
else
  echo "❌ UI Server failed to start"
fi

echo ""
echo "📋 Server PIDs:"
echo "  API: $API_PID"
echo "  UI: $UI_PID"
echo ""
echo "🌐 Access at: http://localhost:5174"
