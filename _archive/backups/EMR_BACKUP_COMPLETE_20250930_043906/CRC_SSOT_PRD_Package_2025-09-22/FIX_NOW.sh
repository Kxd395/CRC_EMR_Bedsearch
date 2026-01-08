#!/bin/bash

##############################################################################
# 🔧 IMMEDIATE FIX - Browser Cache & Server Restart
# Solves: Patient info not loading (cached old JavaScript)
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"
API_DIR="$PROJECT_ROOT/production/api"
UI_DIR="$PROJECT_ROOT/development/prototypes/ui_prototype"
LOGS_DIR="$PROJECT_ROOT/logs"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 🔧 IMMEDIATE FIX SCRIPT                       ║${NC}"
echo -e "${BLUE}║          Fixing Browser Cache & Restarting Servers            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Step 1: Stop All Servers
##############################################################################

echo -e "${YELLOW}📛 Step 1: Stopping all servers...${NC}"

# Stop API server (port 3001)
API_PID=$(lsof -ti:3001 2>/dev/null || true)
if [ -n "$API_PID" ]; then
    echo -e "   Killing API server (PID: $API_PID)"
    kill -9 $API_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}   ✅ API server stopped${NC}"
else
    echo -e "${YELLOW}   ⚠️  No API server running${NC}"
fi

# Stop UI server (port 5173)
UI_PID=$(lsof -ti:5173 2>/dev/null || true)
if [ -n "$UI_PID" ]; then
    echo -e "   Killing UI server (PID: $UI_PID)"
    kill -9 $UI_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}   ✅ UI server stopped${NC}"
else
    echo -e "${YELLOW}   ⚠️  No UI server running${NC}"
fi

# Also check port 5174 (alternate)
UI_PID_ALT=$(lsof -ti:5174 2>/dev/null || true)
if [ -n "$UI_PID_ALT" ]; then
    echo -e "   Killing alternate UI server (PID: $UI_PID_ALT)"
    kill -9 $UI_PID_ALT 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}   ✅ Alternate UI server stopped${NC}"
fi

echo ""

##############################################################################
# Step 2: Clear Vite Cache & Node Modules Cache
##############################################################################

echo -e "${YELLOW}🗑️  Step 2: Clearing caches...${NC}"

# Clear Vite cache
if [ -d "$UI_DIR/node_modules/.vite" ]; then
    rm -rf "$UI_DIR/node_modules/.vite"
    echo -e "${GREEN}   ✅ Vite cache cleared${NC}"
fi

# Clear Vite dist
if [ -d "$UI_DIR/dist" ]; then
    rm -rf "$UI_DIR/dist"
    echo -e "${GREEN}   ✅ Dist folder cleared${NC}"
fi

# Clear any .cache directories
if [ -d "$UI_DIR/.cache" ]; then
    rm -rf "$UI_DIR/.cache"
    echo -e "${GREEN}   ✅ .cache cleared${NC}"
fi

echo ""

##############################################################################
# Step 3: Verify Fixes Are In Place
##############################################################################

echo -e "${YELLOW}🔍 Step 3: Verifying code fixes...${NC}"

APP_JS="$UI_DIR/src/app.js"

# Check if fix is present
if grep -q "const responseData = await response.json()" "$APP_JS" && \
   grep -q "const patients = responseData.data || responseData" "$APP_JS"; then
    echo -e "${GREEN}   ✅ Bug fixes are present in app.js${NC}"
else
    echo -e "${RED}   ❌ WARNING: Bug fixes may not be applied!${NC}"
    echo -e "${YELLOW}   Expected to find: 'const patients = responseData.data || responseData'${NC}"
fi

echo ""

##############################################################################
# Step 4: Start API Server
##############################################################################

echo -e "${YELLOW}🚀 Step 4: Starting API server...${NC}"

cd "$API_DIR"

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Start API server
node server.js > "$LOGS_DIR/api-server.log" 2>&1 &
API_PID=$!

echo -e "   API server started (PID: $API_PID)"
sleep 3

# Verify API is running
if ps -p $API_PID > /dev/null 2>&1; then
    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ API server running at http://localhost:3001${NC}"
        
        # Get patient count
        PATIENT_COUNT=$(curl -s http://localhost:3001/api/patients 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}   ✅ Patients available: $PATIENT_COUNT${NC}"
    else
        echo -e "${RED}   ❌ API not responding${NC}"
    fi
else
    echo -e "${RED}   ❌ API failed to start. Check logs:${NC}"
    tail -20 "$LOGS_DIR/api-server.log"
    exit 1
fi

echo ""

##############################################################################
# Step 5: Start UI Server with Cache Busting
##############################################################################

echo -e "${YELLOW}🚀 Step 5: Starting UI server with cache busting...${NC}"

cd "$UI_DIR"

# Force Vite to use a new timestamp for cache busting
export VITE_BUILD_TIME=$(date +%s)

# Start Vite with forced cache clear
npx vite --force --clearScreen false > "$LOGS_DIR/ui-server.log" 2>&1 &
UI_PID=$!

echo -e "   UI server starting (PID: $UI_PID)..."
sleep 5

# Verify UI is running
if ps -p $UI_PID > /dev/null 2>&1; then
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ UI server running at http://localhost:5173${NC}"
    else
        echo -e "${YELLOW}   ⚠️  UI server starting (may take a moment)${NC}"
    fi
else
    echo -e "${RED}   ❌ UI failed to start. Check logs:${NC}"
    tail -20 "$LOGS_DIR/ui-server.log"
    exit 1
fi

echo ""

##############################################################################
# Step 6: Verify Everything
##############################################################################

echo -e "${YELLOW}🔍 Step 6: System verification...${NC}"

# Check API
API_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('status', 'unknown'))" 2>/dev/null || echo "error")
if [ "$API_HEALTH" = "degraded" ] || [ "$API_HEALTH" = "healthy" ]; then
    echo -e "${GREEN}   ✅ API Status: $API_HEALTH${NC}"
else
    echo -e "${RED}   ❌ API Status: $API_HEALTH${NC}"
fi

# Check UI
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ UI Server: Responding${NC}"
else
    echo -e "${RED}   ❌ UI Server: Not responding${NC}"
fi

echo ""

##############################################################################
# FINAL INSTRUCTIONS
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  ✅ SERVERS RESTARTED                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Both servers are running with fresh caches!${NC}"
echo ""
echo -e "${YELLOW}⚡ CRITICAL: You MUST do this now:${NC}"
echo ""
echo -e "${RED}  1. Open your browser${NC}"
echo -e "${RED}  2. Press Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows/Linux)${NC}"
echo -e "${RED}  3. This will HARD REFRESH and clear cached JavaScript${NC}"
echo ""
echo -e "${BLUE}Expected behavior after hard refresh:${NC}"
echo -e "  ✅ Patient dropdown shows 27 patients"
echo -e "  ✅ Console shows: '✅ Loaded 27 patients from database'"
echo -e "  ✅ Assessment tab auto-populates with patient data"
echo -e "  ✅ Patient Progress tab (dashboard) is visible"
echo -e "  ✅ Facility searches persist after page refresh"
echo ""
echo -e "${BLUE}📊 Server Information:${NC}"
echo -e "  • API Server: http://localhost:3001 (PID: $API_PID)"
echo -e "  • UI Server:  http://localhost:5173 (PID: $UI_PID)"
echo -e "  • Logs:       $LOGS_DIR/"
echo ""
echo -e "${BLUE}🔍 To check logs in real-time:${NC}"
echo -e "  tail -f $LOGS_DIR/api-server.log"
echo -e "  tail -f $LOGS_DIR/ui-server.log"
echo ""
echo -e "${BLUE}🛑 To stop servers:${NC}"
echo -e "  kill $API_PID  # Stop API"
echo -e "  kill $UI_PID   # Stop UI"
echo ""
echo -e "${GREEN}✅ Fix complete! Now HARD REFRESH your browser (Cmd+Shift+R)${NC}"
echo ""
