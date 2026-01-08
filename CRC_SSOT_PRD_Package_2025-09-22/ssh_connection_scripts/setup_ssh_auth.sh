#!/bin/bash
# EMR Database SSH Key Setup and Authentication Fix
# Fixes SSH public key authentication issues for EMR database access
# Version: 1.0.0
# Created: September 30, 2025

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
EMR_SERVER_TAILSCALE="100.112.67.23"
EMR_SERVER_LOCAL="192.168.0.40"
SSH_PORT="2222"
SSH_USER="kxd395"
SSH_KEY_NAME="emr_homelab"
SSH_KEY_PATH="${HOME}/.ssh/${SSH_KEY_NAME}"

echo -e "${BLUE}=== EMR Database SSH Authentication Setup ===${NC}"
echo -e "${CYAN}Fixing SSH public key authentication for database access${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "\n${YELLOW}🔧 STEP $1: $2${NC}"
    echo "----------------------------------------"
}

# Function to check if SSH key exists
check_ssh_key() {
    if [[ -f "${SSH_KEY_PATH}" ]]; then
        echo -e "${GREEN}✅ SSH key found: ${SSH_KEY_PATH}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  SSH key not found: ${SSH_KEY_PATH}${NC}"
        return 1
    fi
}

# Function to generate SSH key
generate_ssh_key() {
    print_step "1" "Generating SSH Key for EMR Database"
    
    if check_ssh_key; then
        echo -e "${CYAN}SSH key already exists. Do you want to generate a new one? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Using existing SSH key${NC}"
            return 0
        fi
        echo -e "${YELLOW}Backing up existing key...${NC}"
        cp "${SSH_KEY_PATH}" "${SSH_KEY_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    echo -e "${CYAN}Generating new SSH key pair...${NC}"
    ssh-keygen -t ed25519 -C "emr-database-${SSH_USER}@homelab" -f "${SSH_KEY_PATH}" -N ""
    
    echo -e "${GREEN}✅ SSH key generated successfully${NC}"
    echo "   Private key: ${SSH_KEY_PATH}"
    echo "   Public key:  ${SSH_KEY_PATH}.pub"
}

# Function to display public key
display_public_key() {
    print_step "2" "SSH Public Key (Copy This)"
    
    if [[ ! -f "${SSH_KEY_PATH}.pub" ]]; then
        echo -e "${RED}❌ Public key not found. Generate SSH key first.${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Copy this ENTIRE public key to the server:${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    cat "${SSH_KEY_PATH}.pub"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Also save to clipboard if available
    if command -v pbcopy >/dev/null 2>&1; then
        cat "${SSH_KEY_PATH}.pub" | pbcopy
        echo -e "${CYAN}📋 Public key copied to clipboard${NC}"
    fi
}

# Function to provide server setup commands
provide_server_commands() {
    print_step "3" "Server Setup Commands (Run on Ubuntu Server)"
    
    echo -e "${CYAN}Run these commands on your Ubuntu server (100.112.67.23):${NC}"
    echo ""
    
    cat << 'EOF'
# 1. Create .ssh directory (if it doesn't exist)
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. Add your public key to authorized_keys
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. Restart SSH service (if needed)
sudo systemctl restart ssh

# 4. Test the SSH configuration
sudo sshd -t
EOF

    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "   • Replace 'PASTE_YOUR_PUBLIC_KEY_HERE' with the ENTIRE public key from Step 2"
    echo "   • Make sure there are no line breaks in the key"
    echo "   • Each public key should be on its own line in authorized_keys"
}

# Function to test SSH connection
test_ssh_connection() {
    print_step "4" "Testing SSH Connection"
    
    echo -e "${CYAN}Testing SSH connection to EMR database server...${NC}"
    
    # Test Tailscale connection first
    echo "Testing Tailscale connection (${EMR_SERVER_TAILSCALE}:${SSH_PORT})..."
    if ssh -i "${SSH_KEY_PATH}" -p "${SSH_PORT}" -o ConnectTimeout=10 -o BatchMode=yes "${SSH_USER}@${EMR_SERVER_TAILSCALE}" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ Tailscale SSH connection successful${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Tailscale SSH connection failed${NC}"
    fi
    
    # Test local network connection
    echo "Testing local network connection (${EMR_SERVER_LOCAL}:${SSH_PORT})..."
    if ssh -i "${SSH_KEY_PATH}" -p "${SSH_PORT}" -o ConnectTimeout=10 -o BatchMode=yes "${SSH_USER}@${EMR_SERVER_LOCAL}" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ Local network SSH connection successful${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Local network SSH connection failed${NC}"
    fi
    
    echo -e "${RED}❌ SSH connection failed on both networks${NC}"
    echo -e "${CYAN}Next steps:${NC}"
    echo "   1. Ensure the public key is correctly added to the server"
    echo "   2. Check SSH service is running on the server"
    echo "   3. Verify the server is accessible on the network"
    return 1
}

# Function to provide troubleshooting steps
provide_troubleshooting() {
    print_step "5" "Troubleshooting SSH Issues"
    
    echo -e "${CYAN}Common SSH authentication issues and solutions:${NC}"
    echo ""
    
    echo -e "${YELLOW}1. Public Key Not Added Correctly:${NC}"
    echo "   • Ensure the ENTIRE public key is on one line in authorized_keys"
    echo "   • Check for extra spaces or line breaks in the key"
    echo "   • Verify authorized_keys file permissions (600)"
    echo ""
    
    echo -e "${YELLOW}2. SSH Directory Permissions:${NC}"
    echo "   • ~/.ssh directory should be 700: chmod 700 ~/.ssh"
    echo "   • ~/.ssh/authorized_keys should be 600: chmod 600 ~/.ssh/authorized_keys"
    echo ""
    
    echo -e "${YELLOW}3. SSH Server Configuration:${NC}"
    echo "   • Check if PubkeyAuthentication is enabled in /etc/ssh/sshd_config"
    echo "   • Restart SSH service after changes: sudo systemctl restart ssh"
    echo ""
    
    echo -e "${YELLOW}4. Network Connectivity:${NC}"
    echo "   • Test basic connectivity: ping ${EMR_SERVER_TAILSCALE}"
    echo "   • Check if SSH port is open: nc -zv ${EMR_SERVER_TAILSCALE} ${SSH_PORT}"
    echo ""
    
    echo -e "${YELLOW}5. Alternative Solutions:${NC}"
    echo "   • Physical server access (recommended for initial setup)"
    echo "   • Temporary password authentication (less secure)"
    echo "   • VNC/remote desktop access to the server"
}

# Function to provide physical access alternative
provide_physical_access_steps() {
    print_step "6" "Physical Server Access Alternative"
    
    echo -e "${CYAN}If you have physical access to the Ubuntu server:${NC}"
    echo ""
    
    echo -e "${GREEN}1. Login directly to the server (keyboard/monitor)${NC}"
    echo -e "${GREEN}2. Run this command to add your public key:${NC}"
    echo ""
    echo "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
    if [[ -f "${SSH_KEY_PATH}.pub" ]]; then
        echo "echo '$(cat "${SSH_KEY_PATH}.pub")' >> ~/.ssh/authorized_keys"
    else
        echo "echo 'YOUR_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys"
    fi
    echo "chmod 600 ~/.ssh/authorized_keys"
    echo ""
    
    echo -e "${GREEN}3. Test SSH from this Mac:${NC}"
    echo "ssh -i ${SSH_KEY_PATH} -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE}"
}

# Function to update SSH config
update_ssh_config() {
    print_step "7" "Updating SSH Configuration"
    
    SSH_CONFIG="${HOME}/.ssh/config"
    EMR_HOST_CONFIG="
# EMR Database Server Configuration
Host emr-db
    HostName ${EMR_SERVER_TAILSCALE}
    Port ${SSH_PORT}
    User ${SSH_USER}
    IdentityFile ${SSH_KEY_PATH}
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host emr-db-local
    HostName ${EMR_SERVER_LOCAL}
    Port ${SSH_PORT}
    User ${SSH_USER}
    IdentityFile ${SSH_KEY_PATH}
    ServerAliveInterval 60
    ServerAliveCountMax 3
"
    
    if [[ ! -f "${SSH_CONFIG}" ]]; then
        echo -e "${CYAN}Creating SSH config file...${NC}"
        touch "${SSH_CONFIG}"
        chmod 600 "${SSH_CONFIG}"
    fi
    
    # Check if EMR config already exists
    if grep -q "Host emr-db" "${SSH_CONFIG}"; then
        echo -e "${YELLOW}⚠️  EMR database SSH config already exists${NC}"
        echo -e "${CYAN}Do you want to update it? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            # Remove existing EMR config and add new one
            sed -i.backup '/# EMR Database Server Configuration/,/ServerAliveCountMax 3/d' "${SSH_CONFIG}"
            echo "$EMR_HOST_CONFIG" >> "${SSH_CONFIG}"
            echo -e "${GREEN}✅ SSH config updated${NC}"
        fi
    else
        echo "$EMR_HOST_CONFIG" >> "${SSH_CONFIG}"
        echo -e "${GREEN}✅ SSH config added${NC}"
    fi
    
    echo -e "${CYAN}You can now connect using:${NC}"
    echo "   ssh emr-db        # Tailscale connection"
    echo "   ssh emr-db-local  # Local network connection"
}

# Main execution function
main() {
    echo -e "${BLUE}🎯 EMR Database SSH Authentication Fix${NC}"
    echo "This script will help you set up SSH key authentication for the EMR database server."
    echo ""
    
    # Check what we need to do
    echo -e "${CYAN}What would you like to do?${NC}"
    echo "1. Generate new SSH key"
    echo "2. Display existing public key"
    echo "3. Test SSH connection"
    echo "4. Show server setup commands"
    echo "5. Show troubleshooting guide"
    echo "6. Show physical access steps"
    echo "7. Update SSH config"
    echo "8. Complete setup (all steps)"
    echo ""
    echo -n "Enter your choice (1-8): "
    read -r choice
    
    case $choice in
        1)
            generate_ssh_key
            ;;
        2)
            display_public_key
            ;;
        3)
            test_ssh_connection
            ;;
        4)
            provide_server_commands
            ;;
        5)
            provide_troubleshooting
            ;;
        6)
            provide_physical_access_steps
            ;;
        7)
            update_ssh_config
            ;;
        8)
            echo -e "${CYAN}Running complete SSH setup...${NC}"
            generate_ssh_key
            display_public_key
            provide_server_commands
            provide_physical_access_steps
            update_ssh_config
            echo ""
            echo -e "${GREEN}🎯 Setup complete! Follow the server setup commands to add your public key.${NC}"
            ;;
        *)
            echo -e "${RED}Invalid choice. Please run the script again.${NC}"
            exit 1
            ;;
    esac
}

# Check for help flag
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "EMR Database SSH Authentication Setup"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "This script helps fix SSH public key authentication issues"
    echo "for connecting to the EMR database server."
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo "  --generate    Generate SSH key only"
    echo "  --display     Display public key only"
    echo "  --test        Test SSH connection only"
    echo ""
    exit 0
fi

# Handle command line options
case "${1:-}" in
    --generate)
        generate_ssh_key
        ;;
    --display)
        display_public_key
        ;;
    --test)
        test_ssh_connection
        ;;
    *)
        main
        ;;
esac

echo ""
echo -e "${GREEN}✅ SSH authentication setup script completed${NC}"
echo -e "${CYAN}Next: Add the public key to your server and test the connection${NC}"