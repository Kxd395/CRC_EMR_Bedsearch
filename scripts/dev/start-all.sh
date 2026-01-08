#!/bin/bash

###############################################################################
# CRC SSOT EMR Development Environment - Complete Startup Script
# Starts both API server (port 3001) and UI server (port 5173/5174)
# Connects to production database at 100.112.67.23
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# SSOT: Use dynamic path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$PROJECT_ROOT/src/api"
UI_DIR="$PROJECT_ROOT/src/web"
LOG_DIR="$PROJECT_ROOT/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

# Log files
API_LOG="$LOG_DIR/api-server.log"
UI_LOG="$LOG_DIR/ui-server.log"

# PID files
API_PID="$LOG_DIR/api-server.pid"
UI_PID="$LOG_DIR/ui-server.pid"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    print_warning "Shutting down servers..."
    
    # Kill API server
    if [ -f "$API_PID" ]; then
        PID=$(cat "$API_PID")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            print_success "API server stopped (PID: $PID)"
        fi
        rm -f "$API_PID"
    fi
    
    # Kill UI server
    if [ -f "$UI_PID" ]; then
        PID=$(cat "$UI_PID")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            print_success "UI server stopped (PID: $PID)"
        fi
        rm -f "$UI_PID"
    fi
    
    # Kill any remaining node processes on our ports
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    
    print_success "All servers stopped. Logs saved in: $LOG_DIR"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

###############################################################################
# Pre-flight Checks
###############################################################################

print_header "🚀 CRC SSOT EMR - Development Environment Startup"

print_info "Checking environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "Node.js $(node --version) detected"
print_success "npm $(npm --version) detected"

# Check if project directories exist
if [ ! -d "$API_DIR" ]; then
    print_error "API directory not found: $API_DIR"
    exit 1
fi

if [ ! -d "$UI_DIR" ]; then
    print_error "UI directory not found: $UI_DIR"
    exit 1
fi

print_success "Project directories verified"

###############################################################################
# Install Dependencies
###############################################################################

print_header "📦 Installing Dependencies"

# Install API dependencies
if [ ! -d "$API_DIR/node_modules" ]; then
    print_info "Installing API server dependencies..."
    cd "$API_DIR"
    npm install
    print_success "API dependencies installed"
else
    print_success "API dependencies already installed"
fi

# Install UI dependencies
if [ ! -d "$UI_DIR/node_modules" ]; then
    print_info "Installing UI dependencies..."
    cd "$UI_DIR"
    npm install
    print_success "UI dependencies installed"
else
    print_success "UI dependencies already installed"
fi

###############################################################################
# Start API Server (Port 3001)
###############################################################################

print_header "🔌 Starting Database API Server (Port 3001)"

cd "$API_DIR"

# Clear old log
> "$API_LOG"

print_info "Database: 100.112.67.23:5432"
print_info "Database Name: emr_crc_ssot"
print_info "User: emr_admin"

# Start API server in background
node server.js > "$API_LOG" 2>&1 &
API_SERVER_PID=$!
echo $API_SERVER_PID > "$API_PID"

# Wait for API server to start
sleep 3

# Check if API server is running
if ! ps -p $API_SERVER_PID > /dev/null 2>&1; then
    print_error "API server failed to start. Check logs:"
    tail -20 "$API_LOG"
    exit 1
fi

# Test API health endpoint
MAX_RETRIES=10
RETRY_COUNT=0
API_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        API_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ "$API_READY" = true ]; then
    print_success "API Server running (PID: $API_SERVER_PID)"
    print_success "URL: http://localhost:3001"
    
    # Get health status
    HEALTH_STATUS=$(curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || echo '{}')
    DB_STATUS=$(echo "$HEALTH_STATUS" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$DB_STATUS" = "connected" ]; then
        print_success "Database: Connected to 100.112.67.23"
    else
        print_warning "Database: Degraded (using fallback data)"
    fi
    
    # Count patients
    PATIENT_COUNT=$(curl -s http://localhost:3001/api/patients | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    print_info "Patients loaded: $PATIENT_COUNT"
else
    print_error "API server not responding to health checks"
    print_info "Check logs: tail -f $API_LOG"
    exit 1
fi

###############################################################################
# Start UI Server (Port 5173/5174)
###############################################################################

print_header "🎨 Starting UI Development Server"

cd "$UI_DIR"

# Clear old log
> "$UI_LOG"

print_info "Starting Vite development server..."

# Start UI server in background
npm run dev > "$UI_LOG" 2>&1 &
UI_SERVER_PID=$!
echo $UI_SERVER_PID > "$UI_PID"

# Wait for UI server to start
sleep 5

# Check if UI server is running
if ! ps -p $UI_SERVER_PID > /dev/null 2>&1; then
    print_error "UI server failed to start. Check logs:"
    tail -20 "$UI_LOG"
    exit 1
fi

# Detect which port Vite is using
UI_PORT=""
if lsof -i:5173 > /dev/null 2>&1; then
    UI_PORT="5173"
elif lsof -i:5174 > /dev/null 2>&1; then
    UI_PORT="5174"
fi

if [ -n "$UI_PORT" ]; then
    print_success "UI Server running (PID: $UI_SERVER_PID)"
    print_success "URL: http://localhost:$UI_PORT"
else
    print_warning "UI server started but port detection failed"
    print_info "Check logs to find the port: tail -f $UI_LOG"
fi

###############################################################################
# Status Summary
###############################################################################

print_header "✅ CRC SSOT Development Environment Ready!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 Server Status${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}API Server:${NC}    http://localhost:3001 (PID: $API_SERVER_PID)"
echo -e "  ${CYAN}UI Server:${NC}     http://localhost:${UI_PORT:-5173} (PID: $UI_SERVER_PID)"
echo -e "  ${CYAN}Database:${NC}      100.112.67.23:5432"
echo -e "  ${CYAN}Patients:${NC}      $PATIENT_COUNT loaded"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 Quick Commands${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${YELLOW}View API logs:${NC}     tail -f $API_LOG"
echo -e "  ${YELLOW}View UI logs:${NC}      tail -f $UI_LOG"
echo -e "  ${YELLOW}Test API health:${NC}   curl http://localhost:3001/health | jq"
echo -e "  ${YELLOW}List patients:${NC}     curl http://localhost:3001/api/patients | jq"
echo -e "  ${YELLOW}Stop servers:${NC}      Press Ctrl+C in this terminal"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧪 Testing Database Persistence${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. Open UI: ${CYAN}http://localhost:${UI_PORT:-5173}${NC}"
echo -e "  2. Open browser console (F12 or Cmd+Option+I)"
echo -e "  3. Look for: ${GREEN}✅ Loaded X patients from database${NC}"
echo -e "  4. Select a patient with ${GREEN}●${NC} prefix (database patient)"
echo -e "  5. Add facility search via Quick Update"
echo -e "  6. Watch console for: ${GREEN}✅ Facility search saved to database${NC}"
echo -e "  7. ${YELLOW}Refresh page${NC} (Cmd+R or Ctrl+R)"
echo -e "  8. Verify search still exists ${GREEN}✅${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
print_info "Press Ctrl+C to stop all servers"
echo ""

###############################################################################
# Monitor Servers
###############################################################################

# Tail both logs
tail -f "$API_LOG" "$UI_LOG" &
TAIL_PID=$!

# Wait for Ctrl+C
wait $API_SERVER_PID $UI_SERVER_PID
