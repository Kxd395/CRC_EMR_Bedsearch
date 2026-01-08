#!/bin/bash

# CRC SSOT Development Environment Setup Script
# This script starts both the API server and UI development server

echo "🚀 Starting CRC SSOT Development Environment"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"
API_DIR="$BASE_DIR/production/api"
UI_DIR="$BASE_DIR/development/prototypes/ui_prototype"

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to start API server
start_api() {
    echo -e "${BLUE}1️⃣  Starting API Server...${NC}"
    
    if [ ! -d "$API_DIR" ]; then
        echo -e "${RED}❌ API directory not found: $API_DIR${NC}"
        exit 1
    fi
    
    if check_port 3001; then
        echo -e "${YELLOW}⚠️  Port 3001 already in use (API may already be running)${NC}"
        echo -e "${GREEN}✅ API Server: http://localhost:3001${NC}"
    else
        cd "$API_DIR"
        echo -e "${BLUE}   📁 Directory: $API_DIR${NC}"
        node server.js &
        API_PID=$!
        echo -e "${GREEN}✅ API Server started (PID: $API_PID)${NC}"
        echo -e "${GREEN}   🌐 API Server: http://localhost:3001${NC}"
        sleep 2
        
        # Verify API is responding
        if curl -s http://localhost:3001/api/health > /dev/null; then
            echo -e "${GREEN}   ✅ API Health Check: PASSED${NC}"
        else
            echo -e "${RED}   ❌ API Health Check: FAILED${NC}"
        fi
    fi
}

# Function to start UI server
start_ui() {
    echo -e "${BLUE}2️⃣  Starting UI Development Server...${NC}"
    
    if [ ! -d "$UI_DIR" ]; then
        echo -e "${RED}❌ UI directory not found: $UI_DIR${NC}"
        exit 1
    fi
    
    cd "$UI_DIR"
    echo -e "${BLUE}   📁 Directory: $UI_DIR${NC}"
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found in UI directory${NC}"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    npm run dev &
    UI_PID=$!
    echo -e "${GREEN}✅ UI Server started (PID: $UI_PID)${NC}"
    sleep 3
    
    # Detect which port Vite is using
    if check_port 5173; then
        echo -e "${GREEN}   🌐 UI Server: http://localhost:5173${NC}"
        UI_PORT=5173
    elif check_port 5174; then
        echo -e "${GREEN}   🌐 UI Server: http://localhost:5174${NC}"
        UI_PORT=5174
    else
        echo -e "${YELLOW}   🔍 UI Server starting... check terminal output for port${NC}"
        UI_PORT="5173 or 5174"
    fi
}

# Function to display status
show_status() {
    echo ""
    echo -e "${GREEN}🎉 CRC SSOT Development Environment Ready!${NC}"
    echo "=========================================="
    echo -e "${BLUE}📊 System Status:${NC}"
    echo -e "   • API Server:  http://localhost:3001"
    echo -e "   • UI Server:   http://localhost:${UI_PORT}"
    echo -e "   • Database:    PostgreSQL (localhost)"
    echo -e "   • Patients:    19 loaded"
    echo -e "   • Facilities:  25 with LOC filtering"
    echo ""
    echo -e "${BLUE}🔧 Available Features:${NC}"
    echo -e "   • Patient selector with 19 patients"
    echo -e "   • Facility Finder with smart filtering"
    echo -e "   • LOC-based facility matching"
    echo -e "   • Real-time search and filters"
    echo -e "   • Database persistence"
    echo ""
    echo -e "${BLUE}💡 Quick Start:${NC}"
    echo -e "   1. Open: ${YELLOW}http://localhost:${UI_PORT}${NC}"
    echo -e "   2. Select a patient (e.g., 'Nguyen, Dana')"
    echo -e "   3. Try the 'Facility Finder' tab"
    echo -e "   4. Test LOC filtering and search"
    echo ""
    echo -e "${YELLOW}⏹️  To stop: Press Ctrl+C${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down development environment...${NC}"
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
        echo -e "${GREEN}✅ API Server stopped${NC}"
    fi
    if [ ! -z "$UI_PID" ]; then
        kill $UI_PID 2>/dev/null
        echo -e "${GREEN}✅ UI Server stopped${NC}"
    fi
    echo -e "${GREEN}👋 Development environment stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if ! pgrep -f postgres > /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not detected. Starting database...${NC}"
    # Try to start PostgreSQL (adjust command based on installation method)
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 2>/dev/null
    else
        echo -e "${RED}❌ Please start PostgreSQL manually${NC}"
    fi
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"
echo ""

# Start services
start_api
echo ""
start_ui
echo ""
show_status

# Keep script running and wait for interrupt
wait