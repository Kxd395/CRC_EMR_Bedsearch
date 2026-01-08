#!/bin/bash
# 🔍 EMR Database Connection Diagnostics
# Home Lab System - EMR Database Server Connection Testing
# Created: September 30, 2025
# Purpose: Comprehensive connection testing for EMR database system

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# EMR Database Server Configuration
EMR_SERVER_TAILSCALE="100.112.67.23"
EMR_SERVER_LOCAL="192.168.0.40"
SSH_PORT="2222"
SSH_USER="kxd395"
DB_PORT="5432"
DB_NAME="emr_placement_ssot"
DB_USER="emr_admin"

# SSH Key Detection Order
SSH_KEYS=(
    "$HOME/.ssh/homelab"
    "$HOME/.ssh/id_rsa"
    "$HOME/.ssh/id_ed25519"
)

echo -e "${BLUE}🔍 EMR Database Connection Diagnostics${NC}"
echo "=================================================="
echo "Target Server: ${EMR_SERVER_TAILSCALE} (Tailscale)"
echo "Fallback: ${EMR_SERVER_LOCAL} (Local Network)"
echo "SSH Port: ${SSH_PORT}"
echo "Database: ${DB_NAME} on port ${DB_PORT}"
echo "Timestamp: $(date)"
echo ""

# Function to test network connectivity
test_network() {
    local host=$1
    local description=$2
    
    echo -n "Testing ${description} connectivity... "
    if ping -c 1 -W 3 "$host" &>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to test port connectivity
test_port() {
    local host=$1
    local port=$2
    local description=$3
    
    echo -n "Testing ${description} port ${port}... "
    if nc -z -w 3 "$host" "$port" 2>/dev/null; then
        echo -e "${GREEN}✅ OPEN${NC}"
        return 0
    else
        echo -e "${RED}❌ CLOSED/FILTERED${NC}"
        return 1
    fi
}

# Function to find working SSH key
find_ssh_key() {
    echo -n "Detecting SSH key... "
    
    for key in "${SSH_KEYS[@]}"; do
        if [[ -f "$key" ]]; then
            # Test if key works
            if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
               "$SSH_USER@$EMR_SERVER_TAILSCALE" "echo 'key test'" &>/dev/null; then
                echo -e "${GREEN}✅ WORKING: $(basename "$key")${NC}"
                echo "$key"
                return 0
            fi
        fi
    done
    
    echo -e "${YELLOW}⚠️  NO WORKING KEY FOUND${NC}"
    return 1
}

# Function to test SSH connectivity
test_ssh() {
    local host=$1
    local description=$2
    
    echo -n "Testing SSH to ${description}... "
    
    # Try to find working SSH key
    ssh_key=$(find_ssh_key 2>/dev/null) || ssh_key=""
    
    if [[ -n "$ssh_key" ]]; then
        if ssh -i "$ssh_key" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
           "$SSH_USER@$host" "echo 'SSH connection successful'" &>/dev/null; then
            echo -e "${GREEN}✅ WORKING${NC}"
            return 0
        fi
    fi
    
    # Try without specific key (ssh-agent or default keys)
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
       "$SSH_USER@$host" "echo 'SSH connection successful'" &>/dev/null; then
        echo -e "${GREEN}✅ WORKING (default key)${NC}"
        return 0
    fi
    
    echo -e "${RED}❌ FAILED${NC}"
    return 1
}

# Function to test PostgreSQL connectivity
test_postgresql() {
    local host=$1
    local description=$2
    
    echo -n "Testing PostgreSQL on ${description}... "
    
    # Find SSH key for tunneling
    ssh_key=""
    for key in "${SSH_KEYS[@]}"; do
        if [[ -f "$key" ]]; then
            ssh_key="-i $key"
            break
        fi
    done
    
    # Test PostgreSQL via SSH
    if ssh $ssh_key -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
       "$SSH_USER@$host" "sudo -u postgres psql -d $DB_NAME -c 'SELECT 1;'" &>/dev/null; then
        echo -e "${GREEN}✅ ACCESSIBLE${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT ACCESSIBLE${NC}"
        return 1
    fi
}

# Function to get system information
get_system_info() {
    local host=$1
    local description=$2
    
    echo -n "Getting system info from ${description}... "
    
    ssh_key=""
    for key in "${SSH_KEYS[@]}"; do
        if [[ -f "$key" ]]; then
            ssh_key="-i $key"
            break
        fi
    done
    
    if system_info=$(ssh $ssh_key -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
                    "$SSH_USER@$host" "hostname && uptime && free -h | head -2 && df -h /" 2>/dev/null); then
        echo -e "${GREEN}✅ RETRIEVED${NC}"
        echo -e "${BLUE}System Information:${NC}"
        echo "$system_info" | sed 's/^/  /'
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check Tailscale status
check_tailscale() {
    echo -n "Checking Tailscale status... "
    
    if command -v tailscale &>/dev/null; then
        if tailscale_status=$(tailscale status 2>/dev/null); then
            if echo "$tailscale_status" | grep -q "$EMR_SERVER_TAILSCALE"; then
                echo -e "${GREEN}✅ CONNECTED${NC}"
                echo -e "${BLUE}Tailscale Device Status:${NC}"
                echo "$tailscale_status" | grep "$EMR_SERVER_TAILSCALE" | sed 's/^/  /'
                return 0
            else
                echo -e "${YELLOW}⚠️  SERVER NOT VISIBLE${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ NOT RUNNING${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  NOT INSTALLED${NC}"
        return 1
    fi
}

# Function to check SSH keys
check_ssh_keys() {
    echo -e "\n${BLUE}📋 SSH Key Analysis${NC}"
    echo "================================"
    
    for key in "${SSH_KEYS[@]}"; do
        echo -n "Checking $(basename "$key")... "
        
        if [[ -f "$key" ]]; then
            # Check permissions
            perms=$(stat -c "%a" "$key" 2>/dev/null || stat -f "%A" "$key" 2>/dev/null)
            if [[ "$perms" == "600" ]]; then
                echo -e "${GREEN}✅ EXISTS (permissions: $perms)${NC}"
                
                # Show key type
                if key_type=$(ssh-keygen -l -f "$key" 2>/dev/null); then
                    echo "    Type: $key_type"
                fi
            else
                echo -e "${YELLOW}⚠️  EXISTS (permissions: $perms - should be 600)${NC}"
            fi
        else
            echo -e "${RED}❌ NOT FOUND${NC}"
        fi
    done
}

# Main diagnostic sequence
main() {
    echo -e "${BLUE}🌐 Network Connectivity Tests${NC}"
    echo "================================"
    
    # Test basic network connectivity
    tailscale_ok=false
    local_ok=false
    
    if test_network "$EMR_SERVER_TAILSCALE" "Tailscale VPN"; then
        tailscale_ok=true
    fi
    
    if test_network "$EMR_SERVER_LOCAL" "Local Network"; then
        local_ok=true
    fi
    
    # Test Tailscale status
    check_tailscale
    
    echo ""
    echo -e "${BLUE}🔌 Port Connectivity Tests${NC}"
    echo "================================"
    
    # Test SSH port
    ssh_tailscale_ok=false
    ssh_local_ok=false
    
    if $tailscale_ok && test_port "$EMR_SERVER_TAILSCALE" "$SSH_PORT" "SSH (Tailscale)"; then
        ssh_tailscale_ok=true
    fi
    
    if $local_ok && test_port "$EMR_SERVER_LOCAL" "$SSH_PORT" "SSH (Local)"; then
        ssh_local_ok=true
    fi
    
    # Test PostgreSQL port
    if $tailscale_ok; then
        test_port "$EMR_SERVER_TAILSCALE" "$DB_PORT" "PostgreSQL (Tailscale)"
    fi
    
    if $local_ok; then
        test_port "$EMR_SERVER_LOCAL" "$DB_PORT" "PostgreSQL (Local)"
    fi
    
    echo ""
    echo -e "${BLUE}🔑 SSH Authentication Tests${NC}"
    echo "================================"
    
    # Check SSH keys first
    check_ssh_keys
    echo ""
    
    # Test SSH connections
    ssh_auth_ok=false
    if $ssh_tailscale_ok && test_ssh "$EMR_SERVER_TAILSCALE" "Tailscale"; then
        ssh_auth_ok=true
        primary_connection="tailscale"
    elif $ssh_local_ok && test_ssh "$EMR_SERVER_LOCAL" "Local Network"; then
        ssh_auth_ok=true
        primary_connection="local"
    fi
    
    echo ""
    echo -e "${BLUE}🗄️ Database Connectivity Tests${NC}"
    echo "================================"
    
    # Test PostgreSQL access
    db_ok=false
    if $ssh_auth_ok; then
        if [[ "$primary_connection" == "tailscale" ]]; then
            if test_postgresql "$EMR_SERVER_TAILSCALE" "Tailscale"; then
                db_ok=true
            fi
        else
            if test_postgresql "$EMR_SERVER_LOCAL" "Local Network"; then
                db_ok=true
            fi
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📊 System Information${NC}"
    echo "================================"
    
    if $ssh_auth_ok; then
        if [[ "$primary_connection" == "tailscale" ]]; then
            get_system_info "$EMR_SERVER_TAILSCALE" "Tailscale"
        else
            get_system_info "$EMR_SERVER_LOCAL" "Local Network"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📋 Diagnostic Summary${NC}"
    echo "================================"
    
    # Overall status
    if $tailscale_ok && $ssh_auth_ok && $db_ok; then
        echo -e "${GREEN}✅ EMR Database System: FULLY OPERATIONAL${NC}"
        echo -e "${GREEN}✅ Recommended connection method: Tailscale VPN${NC}"
        if [[ "$primary_connection" == "tailscale" ]]; then
            echo -e "${GREEN}✅ Primary connection: ssh -p $SSH_PORT $SSH_USER@$EMR_SERVER_TAILSCALE${NC}"
        else
            echo -e "${YELLOW}⚠️  Fallback connection: ssh -p $SSH_PORT $SSH_USER@$EMR_SERVER_LOCAL${NC}"
        fi
    elif $local_ok && $ssh_auth_ok && $db_ok; then
        echo -e "${YELLOW}⚠️  EMR Database System: OPERATIONAL (Local Network Only)${NC}"
        echo -e "${YELLOW}⚠️  Tailscale issue detected - using local network${NC}"
        echo -e "${GREEN}✅ Working connection: ssh -p $SSH_PORT $SSH_USER@$EMR_SERVER_LOCAL${NC}"
    else
        echo -e "${RED}❌ EMR Database System: ISSUES DETECTED${NC}"
        
        if ! $tailscale_ok && ! $local_ok; then
            echo -e "${RED}❌ Network connectivity: Both Tailscale and Local failed${NC}"
        elif ! $ssh_auth_ok; then
            echo -e "${RED}❌ SSH authentication: No working SSH keys found${NC}"
        elif ! $db_ok; then
            echo -e "${RED}❌ Database access: PostgreSQL not accessible${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Next Steps${NC}"
    echo "================================"
    
    if $tailscale_ok && $ssh_auth_ok && $db_ok; then
        echo "✅ System is ready for EMR database operations"
        echo "✅ Run ./ssh_to_database.sh to connect to server"
        echo "✅ Run ./ssh_to_postgres.sh for direct database access"
    else
        if ! $tailscale_ok; then
            echo "🔧 Fix Tailscale: sudo tailscale up"
        fi
        if ! $ssh_auth_ok; then
            echo "🔧 Fix SSH keys: ssh-keygen -t ed25519 -f ~/.ssh/homelab"
            echo "🔧 Copy SSH key: ssh-copy-id -i ~/.ssh/homelab.pub -p $SSH_PORT $SSH_USER@$EMR_SERVER_TAILSCALE"
        fi
        if ! $db_ok; then
            echo "🔧 Check PostgreSQL: ssh -p $SSH_PORT $SSH_USER@$EMR_SERVER_TAILSCALE 'sudo systemctl status postgresql'"
        fi
    fi
    
    echo ""
    echo "Diagnostic completed at $(date)"
}

# Run diagnostics
main "$@"