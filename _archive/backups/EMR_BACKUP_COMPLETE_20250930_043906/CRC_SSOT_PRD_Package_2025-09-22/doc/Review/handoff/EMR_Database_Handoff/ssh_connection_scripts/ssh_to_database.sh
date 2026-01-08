#!/bin/bash
# 🖥️ SSH to EMR Database Server
# Home Lab System - Direct SSH Connection to Ubuntu Server
# Created: September 30, 2025
# Purpose: Interactive SSH session to EMR database server

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

# SSH Key Detection Order (Home Lab Standard)
SSH_KEYS=(
    "$HOME/.ssh/homelab"
    "$HOME/.ssh/id_rsa"
    "$HOME/.ssh/id_ed25519"
)

echo -e "${BLUE}🖥️ Connecting to EMR Database Server${NC}"
echo "=================================================="
echo "Target: EMR Database Server (Ubuntu 24.04)"
echo "Primary: ${EMR_SERVER_TAILSCALE} (Tailscale VPN)"
echo "Fallback: ${EMR_SERVER_LOCAL} (Local Network)"
echo "SSH Port: ${SSH_PORT}"
echo "User: ${SSH_USER}"
echo ""

# Function to test connection and get SSH key
find_working_connection() {
    echo -e "${BLUE}🔍 Detecting optimal connection method...${NC}"
    
    # Test Tailscale connectivity first (preferred)
    echo -n "Testing Tailscale VPN connectivity... "
    if ping -c 1 -W 3 "$EMR_SERVER_TAILSCALE" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        # Try SSH keys with Tailscale
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing SSH key $(basename "$key") via Tailscale... "
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_TAILSCALE" "echo 'connection test'" &>/dev/null; then
                    echo -e "${GREEN}✅ Working${NC}"
                    echo "tailscale,$key"
                    return 0
                else
                    echo -e "${RED}❌ Failed${NC}"
                fi
            fi
        done
        
        # Try default SSH (ssh-agent or default keys)
        echo -n "Testing default SSH authentication via Tailscale... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_TAILSCALE" "echo 'connection test'" &>/dev/null; then
            echo -e "${GREEN}✅ Working${NC}"
            echo "tailscale,default"
            return 0
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    # Test local network as fallback
    echo -n "Testing Local Network connectivity... "
    if ping -c 1 -W 3 "$EMR_SERVER_LOCAL" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        # Try SSH keys with local network
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing SSH key $(basename "$key") via Local Network... "
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_LOCAL" "echo 'connection test'" &>/dev/null; then
                    echo -e "${GREEN}✅ Working${NC}"
                    echo "local,$key"
                    return 0
                else
                    echo -e "${RED}❌ Failed${NC}"
                fi
            fi
        done
        
        # Try default SSH
        echo -n "Testing default SSH authentication via Local Network... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_LOCAL" "echo 'connection test'" &>/dev/null; then
            echo -e "${GREEN}✅ Working${NC}"
            echo "local,default"
            return 0
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    echo "none,none"
    return 1
}

# Function to show connection troubleshooting
show_troubleshooting() {
    echo -e "\n${RED}❌ Connection Failed${NC}"
    echo "================================"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting Steps:${NC}"
    echo ""
    
    echo "1. Check Tailscale VPN:"
    echo "   tailscale status"
    echo "   sudo tailscale up"
    echo ""
    
    echo "2. Check SSH keys exist:"
    echo "   ls -la ~/.ssh/"
    echo ""
    
    echo "3. Generate new SSH key if needed:"
    echo "   ssh-keygen -t ed25519 -f ~/.ssh/homelab -C 'homelab-emr-$(date +%Y%m%d)'"
    echo "   chmod 600 ~/.ssh/homelab"
    echo ""
    
    echo "4. Copy SSH key to server (via password):"
    echo "   ssh-copy-id -i ~/.ssh/homelab.pub -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE}"
    echo ""
    
    echo "5. Test connection manually:"
    echo "   ssh -v -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE}"
    echo ""
    
    echo "6. Use local network as fallback:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_LOCAL}"
    echo ""
    
    echo -e "${BLUE}📋 For comprehensive diagnostics, run:${NC}"
    echo "   ./connection_diagnostics.sh"
}

# Function to establish SSH connection
connect_to_server() {
    local connection_info=$1
    IFS=',' read -r network key <<< "$connection_info"
    
    if [[ "$network" == "tailscale" ]]; then
        target_host="$EMR_SERVER_TAILSCALE"
        connection_type="Tailscale VPN"
    elif [[ "$network" == "local" ]]; then
        target_host="$EMR_SERVER_LOCAL"
        connection_type="Local Network"
    else
        echo -e "${RED}❌ No working connection found${NC}"
        show_troubleshooting
        exit 1
    fi
    
    echo -e "${GREEN}✅ Connection method: ${connection_type}${NC}"
    echo -e "${GREEN}✅ Target host: ${target_host}${NC}"
    
    if [[ "$key" != "default" ]]; then
        echo -e "${GREEN}✅ SSH key: $(basename "$key")${NC}"
        ssh_opts="-i $key"
    else
        echo -e "${GREEN}✅ SSH key: default/ssh-agent${NC}"
        ssh_opts=""
    fi
    
    echo ""
    echo -e "${BLUE}🚀 Establishing SSH connection...${NC}"
    echo "Press Ctrl+C to cancel, or wait for connection..."
    echo ""
    
    # Add helpful SSH options
    ssh_command="ssh $ssh_opts -p $SSH_PORT -o ServerAliveInterval=60 -o ServerAliveCountMax=3 $SSH_USER@$target_host"
    
    echo -e "${BLUE}Connection command: ${ssh_command}${NC}"
    echo ""
    
    # Show server info on connection
    echo -e "${BLUE}📊 Server Information:${NC}"
    if server_info=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                    "echo 'Hostname:' \$(hostname) && echo 'Uptime:' && uptime && echo 'Memory:' && free -h | head -2" 2>/dev/null); then
        echo "$server_info"
    else
        echo "Could not retrieve server information"
    fi
    
    echo ""
    echo -e "${GREEN}🎯 Connected to EMR Database Server!${NC}"
    echo -e "${BLUE}Useful commands once connected:${NC}"
    echo "  sudo systemctl status postgresql    # Check PostgreSQL status"
    echo "  sudo -u postgres psql -l           # List databases"
    echo "  sudo -u postgres psql -d emr_placement_ssot  # Connect to EMR database"
    echo "  htop                               # System monitor"
    echo "  df -h                              # Disk usage"
    echo "  free -h                            # Memory usage"
    echo "  exit                               # Disconnect"
    echo ""
    
    # Execute the SSH connection
    exec ssh $ssh_opts -p "$SSH_PORT" -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$SSH_USER@$target_host"
}

# Main execution
main() {
    # Find working connection
    if connection_info=$(find_working_connection); then
        connect_to_server "$connection_info"
    else
        show_troubleshooting
        exit 1
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Connection cancelled by user${NC}"; exit 1' INT

# Run the connection script
main "$@"