#!/bin/bash
# 🗄️ SSH to PostgreSQL - Direct EMR Database Access
# Home Lab System - Direct connection to EMR PostgreSQL database
# Created: September 30, 2025
# Purpose: Direct PostgreSQL access via SSH tunnel

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
DB_NAME="emr_placement_ssot"
DB_USER="postgres"  # Using postgres superuser for administrative access

# SSH Key Detection Order
SSH_KEYS=(
    "$HOME/.ssh/homelab"
    "$HOME/.ssh/id_rsa"
    "$HOME/.ssh/id_ed25519"
)

echo -e "${BLUE}🗄️ Connecting to EMR PostgreSQL Database${NC}"
echo "=================================================="
echo "Database: ${DB_NAME}"
echo "PostgreSQL Version: 16"
echo "Connection: Via SSH tunnel"
echo "User: ${DB_USER} (administrative access)"
echo ""

# Function to find working SSH connection
find_ssh_connection() {
    echo -e "${BLUE}🔍 Finding optimal database connection...${NC}"
    
    # Test Tailscale first
    echo -n "Testing Tailscale VPN connection... "
    if ping -c 1 -W 3 "$EMR_SERVER_TAILSCALE" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing SSH key $(basename "$key") for database access... "
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_TAILSCALE" "sudo -u postgres psql -d $DB_NAME -c 'SELECT version();'" &>/dev/null; then
                    echo -e "${GREEN}✅ Database accessible${NC}"
                    echo "tailscale,$key"
                    return 0
                else
                    echo -e "${RED}❌ Database not accessible${NC}"
                fi
            fi
        done
        
        # Try default key
        echo -n "Testing default SSH for database access... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_TAILSCALE" "sudo -u postgres psql -d $DB_NAME -c 'SELECT version();'" &>/dev/null; then
            echo -e "${GREEN}✅ Database accessible${NC}"
            echo "tailscale,default"
            return 0
        else
            echo -e "${RED}❌ Database not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    # Test local network
    echo -n "Testing Local Network connection... "
    if ping -c 1 -W 3 "$EMR_SERVER_LOCAL" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing SSH key $(basename "$key") for database access... "
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_LOCAL" "sudo -u postgres psql -d $DB_NAME -c 'SELECT version();'" &>/dev/null; then
                    echo -e "${GREEN}✅ Database accessible${NC}"
                    echo "local,$key"
                    return 0
                else
                    echo -e "${RED}❌ Database not accessible${NC}"
                fi
            fi
        done
        
        # Try default key
        echo -n "Testing default SSH for database access... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_LOCAL" "sudo -u postgres psql -d $DB_NAME -c 'SELECT version();'" &>/dev/null; then
            echo -e "${GREEN}✅ Database accessible${NC}"
            echo "local,default"
            return 0
        else
            echo -e "${RED}❌ Database not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    echo "none,none"
    return 1
}

# Function to show database troubleshooting
show_database_troubleshooting() {
    echo -e "\n${RED}❌ Database Connection Failed${NC}"
    echo "================================"
    echo ""
    echo -e "${YELLOW}🔧 Database Troubleshooting Steps:${NC}"
    echo ""
    
    echo "1. Check if PostgreSQL is running:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo systemctl status postgresql'"
    echo ""
    
    echo "2. Start PostgreSQL if stopped:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo systemctl start postgresql'"
    echo ""
    
    echo "3. Check if EMR database exists:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres psql -l'"
    echo ""
    
    echo "4. Create EMR database if missing:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres createdb ${DB_NAME}'"
    echo ""
    
    echo "5. Check PostgreSQL logs:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo tail -f /var/log/postgresql/postgresql-16-main.log'"
    echo ""
    
    echo -e "${BLUE}📋 For SSH connection issues, run:${NC}"
    echo "   ./connection_diagnostics.sh"
    echo ""
    
    echo -e "${BLUE}📋 For manual database connection:${NC}"
    echo "   ./ssh_to_database.sh"
    echo "   # Then once connected:"
    echo "   sudo -u postgres psql -d ${DB_NAME}"
}

# Function to show database information
show_database_info() {
    local connection_info=$1
    IFS=',' read -r network key <<< "$connection_info"
    
    if [[ "$network" == "tailscale" ]]; then
        target_host="$EMR_SERVER_TAILSCALE"
    else
        target_host="$EMR_SERVER_LOCAL"
    fi
    
    if [[ "$key" != "default" ]]; then
        ssh_opts="-i $key"
    else
        ssh_opts=""
    fi
    
    echo -e "${BLUE}📊 EMR Database Information:${NC}"
    if db_info=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                "sudo -u postgres psql -d $DB_NAME -t -c \"
                SELECT 
                    'Database: ' || current_database() || E'\\n' ||
                    'Version: ' || version() || E'\\n' ||
                    'Size: ' || pg_size_pretty(pg_database_size(current_database())) || E'\\n' ||
                    'Tables: ' || (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public')::text || E'\\n' ||
                    'Current Time: ' || now()::text;
                \"" 2>/dev/null); then
        echo "$db_info" | sed 's/^/  /'
    else
        echo "  Could not retrieve database information"
    fi
    
    echo ""
    echo -e "${BLUE}📋 EMR Tables Status:${NC}"
    if table_info=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                   "sudo -u postgres psql -d $DB_NAME -c \"
                   SELECT 
                       t.table_name,
                       COALESCE(s.n_tup_ins, 0) as records,
                       pg_size_pretty(pg_total_relation_size('public.' || t.table_name)) as size
                   FROM information_schema.tables t
                   LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
                   WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
                   ORDER BY t.table_name;
                   \"" 2>/dev/null); then
        echo "$table_info" | sed 's/^/  /'
    else
        echo "  Could not retrieve table information"
    fi
}

# Function to connect to PostgreSQL
connect_to_postgresql() {
    local connection_info=$1
    IFS=',' read -r network key <<< "$connection_info"
    
    if [[ "$network" == "tailscale" ]]; then
        target_host="$EMR_SERVER_TAILSCALE"
        connection_type="Tailscale VPN"
    elif [[ "$network" == "local" ]]; then
        target_host="$EMR_SERVER_LOCAL"
        connection_type="Local Network"
    else
        echo -e "${RED}❌ No working database connection found${NC}"
        show_database_troubleshooting
        exit 1
    fi
    
    echo -e "${GREEN}✅ Database connection method: ${connection_type}${NC}"
    echo -e "${GREEN}✅ Target host: ${target_host}${NC}"
    
    if [[ "$key" != "default" ]]; then
        echo -e "${GREEN}✅ SSH key: $(basename "$key")${NC}"
        ssh_opts="-i $key"
    else
        echo -e "${GREEN}✅ SSH key: default/ssh-agent${NC}"
        ssh_opts=""
    fi
    
    echo ""
    
    # Show database information
    show_database_info "$connection_info"
    
    echo ""
    echo -e "${GREEN}🎯 Connecting to EMR PostgreSQL Database!${NC}"
    echo ""
    echo -e "${BLUE}📚 Useful PostgreSQL commands:${NC}"
    echo "  \\dt                           # List all tables"
    echo "  \\d patients                  # Describe patients table"
    echo "  \\d+ facilities               # Detailed facilities table info"
    echo "  SELECT COUNT(*) FROM patients; # Count patient records"
    echo "  SELECT * FROM v_active_placement_searches LIMIT 10; # View active placements"
    echo "  \\q                           # Quit PostgreSQL"
    echo ""
    echo -e "${BLUE}📊 EMR-specific queries:${NC}"
    echo "  SELECT COUNT(*) FROM patients;           # Total patients"
    echo "  SELECT COUNT(*) FROM facilities;         # Total facilities"
    echo "  SELECT COUNT(*) FROM placement_search;   # Total placements"
    echo "  SELECT COUNT(*) FROM audit_log;          # Audit entries"
    echo ""
    echo -e "${YELLOW}⚠️  You are connecting as 'postgres' superuser - use carefully!${NC}"
    echo ""
    
    # Execute the PostgreSQL connection via SSH
    echo -e "${BLUE}🚀 Establishing PostgreSQL connection...${NC}"
    exec ssh $ssh_opts -p "$SSH_PORT" -t "$SSH_USER@$target_host" "sudo -u postgres psql -d $DB_NAME"
}

# Main execution
main() {
    echo -e "${BLUE}🔍 Initializing EMR database connection...${NC}"
    echo ""
    
    # Find working connection
    if connection_info=$(find_ssh_connection); then
        connect_to_postgresql "$connection_info"
    else
        show_database_troubleshooting
        exit 1
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Database connection cancelled by user${NC}"; exit 1' INT

# Run the connection script
main "$@"