#!/bin/bash

# EMR Server Status Checker
# Use this script to quickly check if your development servers are running

echo "🏥 EMR CRC SSOT Server Status Check"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check API Server (Port 3001)
echo "🔍 Checking API Server (Port 3001)..."
if curl -s --max-time 5 http://localhost:3001/api/health > /dev/null; then
    API_RESPONSE=$(curl -s http://localhost:3001/api/health)
    if echo "$API_RESPONSE" | grep -q '"success":true'; then
        echo -e "   ${GREEN}✅ API Server: RUNNING${NC} - http://localhost:3001"
        # Check if database is connected
        if echo "$API_RESPONSE" | grep -q '"database":true'; then
            echo -e "   ${GREEN}   📊 Database: CONNECTED${NC}"
        else
            echo -e "   ${YELLOW}   ⚠️  Database: FALLBACK MODE${NC}"
        fi
    else
        echo -e "   ${RED}❌ API Server: ERROR${NC}"
    fi
else
    echo -e "   ${RED}❌ API Server: NOT RUNNING${NC}"
fi

echo ""

# Check UI Server (Port 5174)
echo "🔍 Checking UI Server (Port 5174)..."
if curl -s --max-time 5 http://localhost:5174 > /dev/null; then
    echo -e "   ${GREEN}✅ UI Server: RUNNING${NC} - http://localhost:5174"
else
    echo -e "   ${RED}❌ UI Server: NOT RUNNING${NC}"
fi

echo ""

# Check processes
echo "🔍 Process Information..."
API_PID=$(lsof -ti :3001 2>/dev/null)
UI_PID=$(lsof -ti :5174 2>/dev/null)

if [ -n "$API_PID" ]; then
    echo -e "   ${GREEN}API Process: PID $API_PID${NC}"
else
    echo -e "   ${RED}API Process: Not found${NC}"
fi

if [ -n "$UI_PID" ]; then
    echo -e "   ${GREEN}UI Process: PID $UI_PID${NC}"
else
    echo -e "   ${RED}UI Process: Not found${NC}"
fi

echo ""

# Test Placement Search endpoint specifically
echo "🔍 Testing Placement Search functionality..."
if curl -s --max-time 5 "http://localhost:3001/api/patients" > /dev/null; then
    PATIENT_COUNT=$(curl -s "http://localhost:3001/api/patients" | jq length 2>/dev/null || echo "unknown")
    echo -e "   ${GREEN}✅ Patients endpoint: WORKING${NC} ($PATIENT_COUNT patients)"
else
    echo -e "   ${RED}❌ Patients endpoint: FAILED${NC}"
fi

echo ""
echo "🚀 Quick Actions:"
echo "   • Open UI: http://localhost:5174"
echo "   • Test API: curl http://localhost:3001/api/health"
echo "   • Stop servers: Ctrl+C in terminal windows"
echo "   • Restart: ./start-dev.sh"
echo ""

# Check for common issues
echo "🛠️  Troubleshooting:"
if ! command -v curl &> /dev/null; then
    echo -e "   ${YELLOW}⚠️  curl not installed - install with: brew install curl${NC}"
fi

if ! command -v jq &> /dev/null; then
    echo -e "   ${YELLOW}⚠️  jq not installed - install with: brew install jq${NC}"
fi

echo "   • If servers won't start: Check for port conflicts"
echo "   • If placement search freezes: Check browser console for errors"
echo "   • If data won't save: Verify database connection above"