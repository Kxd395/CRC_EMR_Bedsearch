#!/bin/bash

# Quick Setup: Netlify + Your Local Database via ngrok
# This allows Netlify to access your local database for testing

echo "🌐 Setting up Netlify with Your Local Database"
echo "============================================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    # Install via homebrew if available
    if command -v brew &> /dev/null; then
        brew install ngrok/ngrok/ngrok
    else
        echo "❌ Please install ngrok manually from https://ngrok.com"
        echo "   Then run this script again"
        exit 1
    fi
fi

echo "✅ ngrok is available"

# Check if API server is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "🚀 Starting your API server..."
    cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
    node server.js &
    API_PID=$!
    echo "✅ API Server started (PID: $API_PID)"
    sleep 3
fi

# Start ngrok tunnel
echo "🌉 Creating ngrok tunnel to your local server..."
ngrok http 3001 --log=stdout > ngrok.log &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 5

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ "$NGROK_URL" = "null" ] || [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL. Checking status..."
    curl -s http://localhost:4040/api/tunnels | jq .
    exit 1
fi

echo "🎉 Tunnel created successfully!"
echo "🌐 Your API is now accessible at: $NGROK_URL"

# Test the tunnel
echo "🧪 Testing tunnel connection..."
HEALTH_CHECK=$(curl -s "$NGROK_URL/api/health")
if [[ $HEALTH_CHECK == *"success"* ]]; then
    echo "✅ Tunnel test successful!"
    PATIENT_COUNT=$(curl -s "$NGROK_URL/api/patients" | jq -r '.count' 2>/dev/null)
    echo "📊 Patients accessible via tunnel: $PATIENT_COUNT"
else
    echo "❌ Tunnel test failed"
    echo "Response: $HEALTH_CHECK"
    exit 1
fi

# Configure Netlify build
echo "🔧 Configuring Netlify build for your database..."
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Run the database setup with the ngrok URL
node setup-database-netlify.js "$NGROK_URL"

echo ""
echo "🎯 NETLIFY DEPLOYMENT WITH YOUR DATABASE:"
echo "=========================================="
echo "🔗 API URL: $NGROK_URL"
echo "📊 Patients: 19 from your local database"
echo "🏥 Facilities: 25 with full LOC filtering"
echo ""
echo "📤 Deploy to Netlify:"
echo "1. Drag the 'dist' folder to netlify.com"
echo "2. OR push to GitHub and connect repository"
echo "3. Set environment variable in Netlify:"
echo "   VITE_API_URL = $NGROK_URL"
echo ""
echo "⚠️  Important: Keep this terminal open!"
echo "   The ngrok tunnel must stay running for Netlify to access your database"
echo ""
echo "🛑 To stop: Press Ctrl+C (will stop ngrok and API server)"

# Keep running until interrupted
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null
        echo "✅ ngrok tunnel stopped"
    fi
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
        echo "✅ API server stopped"
    fi
    echo "👋 Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for interrupt
echo "💡 Your database is now accessible to Netlify via: $NGROK_URL"
echo "   Press Ctrl+C to stop the tunnel"
wait