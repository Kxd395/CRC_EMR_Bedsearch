#!/bin/bash

# CRC SSOT - Start Database API Server & UI Development Server
# This script starts both servers needed for full database persistence

set -e

echo "🚀 Starting CRC SSOT Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -d "src/api" ] || [ ! -d "src/web" ]; then
    echo -e "${RED}❌ Error: Must run from CRC_SSOT_PRD_Package_2025-09-22 directory${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Database API Server (Port 3001)
echo -e "${BLUE}📊 Starting Database API Server on port 3001...${NC}"
cd src/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing API dependencies...${NC}"
    npm install
fi

# Start the server in background
node server.js > ../../api-server.log 2>&1 &
API_PID=$!

# Wait for API server to start
echo "⏳ Waiting for API server to initialize..."
sleep 3

# Check if API server is running
if ps -p $API_PID > /dev/null; then
    echo -e "${GREEN}✅ API Server running (PID: $API_PID)${NC}"
    echo -e "   URL: ${GREEN}http://localhost:3001${NC}"
    echo -e "   Logs: ${YELLOW}api-server.log${NC}"
else
    echo -e "${RED}❌ API Server failed to start${NC}"
    echo "Check api-server.log for details"
    exit 1
fi

cd ../..

# Start UI Development Server (Port 5174)
echo ""
echo -e "${BLUE}🎨 Starting UI Development Server on port 5174...${NC}"
cd src/web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing UI dependencies...${NC}"
    npm install
fi

# Start Vite dev server in background
npm run dev > ../../../vite-server.log 2>&1 &
VITE_PID=$!

# Wait for Vite to start
echo "⏳ Waiting for Vite server to initialize..."
sleep 5

# Check if Vite server is running
if ps -p $VITE_PID > /dev/null; then
    echo -e "${GREEN}✅ UI Server running (PID: $VITE_PID)${NC}"
    echo -e "   URL: ${GREEN}http://localhost:5174${NC}"
    echo -e "   Logs: ${YELLOW}vite-server.log${NC}"
else
    echo -e "${RED}❌ UI Server failed to start${NC}"
    echo "Check vite-server.log for details"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

cd ../../..

# Display status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CRC SSOT Development Environment Ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Database API Server:${NC}"
echo -e "   • ${GREEN}http://localhost:3001${NC}"
echo -e "   • Health check: ${YELLOW}http://localhost:3001/health${NC}"
echo -e "   • Patients API: ${YELLOW}http://localhost:3001/api/patients${NC}"
echo ""
echo -e "${BLUE}🎨 UI Development Server:${NC}"
echo -e "   • ${GREEN}http://localhost:5174${NC}"
echo -e "   • Open in browser to test database persistence"
echo ""
echo -e "${BLUE}📋 Features:${NC}"
echo -e "   • ✅ Database-first architecture"
echo -e "   • ✅ Automatic retry with exponential backoff"
echo -e "   • ✅ Background reconnection (10s intervals)"
echo -e "   • ✅ Periodic sync (30s intervals)"
echo -e "   • ✅ Immediate save on facility search creation"
echo -e "   • ✅ Patient Progress Dashboard"
echo ""
echo -e "${BLUE}🔍 Testing Database Persistence:${NC}"
echo -e "   1. Open ${GREEN}http://localhost:5174${NC} in browser"
echo -e "   2. Select a patient (ones with ${GREEN}●${NC} are from database)"
echo -e "   3. Add a facility search via Quick Update"
echo -e "   4. Watch console: '${GREEN}✅ Facility search saved to database${NC}'"
echo -e "   5. ${YELLOW}Refresh the page${NC} (Cmd+R or Ctrl+R)"
echo -e "   6. Verify search still exists ${GREEN}✅${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   • API Server: ${BLUE}tail -f api-server.log${NC}"
echo -e "   • UI Server: ${BLUE}tail -f vite-server.log${NC}"
echo ""
echo -e "${YELLOW}🛑 To stop: Press Ctrl+C${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Keep script running and show logs
echo "📊 Showing API Server logs (Ctrl+C to stop all servers):"
echo ""
tail -f api-server.log &
TAIL_PID=$!

# Wait for user interrupt
wait $API_PID $VITE_PID
