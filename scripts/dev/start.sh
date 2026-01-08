#!/bin/bash

###############################################################################
# Simple Startup Script - Start Both Servers
# Run this with: bash start-simple.sh
###############################################################################

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths - SSOT: Use dynamic resolution, never hardcode
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$PROJECT_ROOT/src/api"
UI_DIR="$PROJECT_ROOT/src/web"

echo ""
echo -e "${CYAN}🚀 Starting CRC SSOT Development Environment${NC}"
echo ""

# Start API Server
echo -e "${GREEN}📡 Starting API Server (port 3001)...${NC}"
cd "$API_DIR"
node server.js > "$PROJECT_ROOT/logs/api-server.log" 2>&1 &
echo "   PID: $!"

sleep 3

# Start UI Server  
echo -e "${GREEN}🎨 Starting UI Server (port 5173)...${NC}"
cd "$UI_DIR"
npm run dev > "$PROJECT_ROOT/logs/ui-server.log" 2>&1 &
echo "   PID: $!"

sleep 5

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Both servers started!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}API:${NC}  http://localhost:3001"
echo -e "  ${CYAN}UI:${NC}   http://localhost:5173"
echo ""
echo -e "${GREEN}📝 View logs:${NC}"
echo "  tail -f $PROJECT_ROOT/logs/api-server.log"
echo "  tail -f $PROJECT_ROOT/logs/ui-server.log"
echo ""
echo -e "${GREEN}🛑 Stop servers:${NC}"
echo "  lsof -ti:3001 | xargs kill"
echo "  lsof -ti:5173 | xargs kill"
echo ""
