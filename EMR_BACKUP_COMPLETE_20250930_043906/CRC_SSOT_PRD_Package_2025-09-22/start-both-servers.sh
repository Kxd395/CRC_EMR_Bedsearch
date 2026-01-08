#!/bin/bash

# Simple EMR Development Server Starter
# This starts both servers and keeps them running

echo "🏥 Starting EMR CRC SSOT Development Environment"
echo "=============================================="

# Kill any existing processes on our ports
echo "🔧 Cleaning up existing processes..."
lsof -ti :3001 | xargs kill -9 2>/dev/null || true
lsof -ti :5174 | xargs kill -9 2>/dev/null || true
sleep 2

# Start API Server in background
echo "1️⃣ Starting API Server..."
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
node server.js &
API_PID=$!
echo "   API Server PID: $API_PID"

# Wait for API to be ready
sleep 3
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "   ✅ API Server ready: http://localhost:3001"
else
    echo "   ❌ API Server failed to start"
    exit 1
fi

# Start UI Server
echo "2️⃣ Starting UI Server..."
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "   📝 Created .env file with API URL"
fi

# Start UI server
npm run dev -- --port 5174 &
UI_PID=$!
echo "   UI Server PID: $UI_PID"

# Wait for UI to be ready
sleep 5
if curl -s http://localhost:5174 > /dev/null; then
    echo "   ✅ UI Server ready: http://localhost:5174"
else
    echo "   ⚠️ UI Server might still be starting..."
fi

echo ""
echo "🎉 Development Environment Ready!"
echo "================================"
echo "📊 Status:"
echo "   • API Server:  http://localhost:3001 (PID: $API_PID)"
echo "   • UI Server:   http://localhost:5174 (PID: $UI_PID)"
echo ""
echo "🚀 Open this URL in your browser:"
echo "   http://localhost:5174"
echo ""
echo "🛠️ To check status anytime:"
echo "   ./check-servers.sh"
echo ""
echo "⏹️  To stop servers:"
echo "   kill $API_PID $UI_PID"
echo "   or press Ctrl+C"
echo ""

# Keep script running so servers stay active
echo "💡 Servers running... Press Ctrl+C to stop all servers"
trap 'echo "🛑 Stopping servers..."; kill $API_PID $UI_PID 2>/dev/null; exit 0' INT

# Wait indefinitely
while true; do
    sleep 60
    # Check if processes are still running
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "❌ API Server died (PID $API_PID)"
        break
    fi
    if ! kill -0 $UI_PID 2>/dev/null; then
        echo "❌ UI Server died (PID $UI_PID)"
        break
    fi
done