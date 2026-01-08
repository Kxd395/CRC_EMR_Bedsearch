#!/bin/bash
# 🏥 Connect to EMR Database - Healthcare Application Connection
# Home Lab System - EMR Database connection with application user credentials
# Created: September 30, 2025
# Purpose: Application-level connection to EMR database system

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
DB_APP_USER="emr_admin"  # Application user with proper EMR permissions

# SSH Key Detection Order
SSH_KEYS=(
    "$HOME/.ssh/homelab"
    "$HOME/.ssh/id_rsa"
    "$HOME/.ssh/id_ed25519"
)

echo -e "${BLUE}🏥 EMR Database Application Connection${NC}"
echo "=================================================="
echo "Database: ${DB_NAME}"
echo "Application User: ${DB_APP_USER}"
echo "Purpose: Healthcare application development/testing"
echo "HIPAA Compliance: ✅ Audit logging enabled"
echo ""

# Function to find working EMR database connection
find_emr_connection() {
    echo -e "${BLUE}🔍 Testing EMR database application access...${NC}"
    
    # Test Tailscale first (preferred)
    echo -n "Testing Tailscale VPN for EMR access... "
    if ping -c 1 -W 3 "$EMR_SERVER_TAILSCALE" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing EMR database access with $(basename "$key")... "
                # Test if we can connect to the EMR database with application user
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_TAILSCALE" \
                   "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM patients;'" &>/dev/null; then
                    echo -e "${GREEN}✅ EMR accessible${NC}"
                    echo "tailscale,$key"
                    return 0
                else
                    echo -e "${RED}❌ EMR not accessible${NC}"
                fi
            fi
        done
        
        # Try default key
        echo -n "Testing EMR access with default SSH... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_TAILSCALE" \
           "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM patients;'" &>/dev/null; then
            echo -e "${GREEN}✅ EMR accessible${NC}"
            echo "tailscale,default"
            return 0
        else
            echo -e "${RED}❌ EMR not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    # Test local network fallback
    echo -n "Testing Local Network for EMR access... "
    if ping -c 1 -W 3 "$EMR_SERVER_LOCAL" &>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        
        for key in "${SSH_KEYS[@]}"; do
            if [[ -f "$key" ]]; then
                echo -n "Testing EMR database access with $(basename "$key")... "
                if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
                   "$SSH_USER@$EMR_SERVER_LOCAL" \
                   "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM patients;'" &>/dev/null; then
                    echo -e "${GREEN}✅ EMR accessible${NC}"
                    echo "local,$key"
                    return 0
                else
                    echo -e "${RED}❌ EMR not accessible${NC}"
                fi
            fi
        done
        
        # Try default key
        echo -n "Testing EMR access with default SSH... "
        if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes \
           "$SSH_USER@$EMR_SERVER_LOCAL" \
           "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM patients;'" &>/dev/null; then
            echo -e "${GREEN}✅ EMR accessible${NC}"
            echo "local,default"
            return 0
        else
            echo -e "${RED}❌ EMR not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not available${NC}"
    fi
    
    echo "none,none"
    return 1
}

# Function to show EMR troubleshooting
show_emr_troubleshooting() {
    echo -e "\n${RED}❌ EMR Database Connection Failed${NC}"
    echo "================================"
    echo ""
    echo -e "${YELLOW}🔧 EMR Database Troubleshooting:${NC}"
    echo ""
    
    echo "1. Check if EMR database exists:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres psql -l | grep emr'"
    echo ""
    
    echo "2. Check if EMR user exists:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres psql -c \"\\du\"'"
    echo ""
    
    echo "3. Create EMR user if missing:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres createuser -P ${DB_APP_USER}'"
    echo ""
    
    echo "4. Grant EMR permissions:"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_APP_USER};\"'"
    echo ""
    
    echo "5. Deploy EMR schema if missing:"
    echo "   cd ../deployment_scripts && ./apply_schema.sh"
    echo ""
    
    echo "6. Check PostgreSQL authentication (pg_hba.conf):"
    echo "   ssh -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER_TAILSCALE} 'sudo cat /etc/postgresql/16/main/pg_hba.conf'"
    echo ""
    
    echo -e "${BLUE}📋 For comprehensive diagnostics:${NC}"
    echo "   ./connection_diagnostics.sh"
    echo ""
    
    echo -e "${BLUE}📋 For administrative database access:${NC}"
    echo "   ./ssh_to_postgres.sh"
}

# Function to show EMR database status
show_emr_status() {
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
    
    echo -e "${BLUE}📊 EMR Database Status:${NC}"
    if emr_status=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                   "psql -h localhost -U $DB_APP_USER -d $DB_NAME -t -c \"
                   SELECT 
                       'EMR Database: ' || current_database() || E'\\n' ||
                       'Connected User: ' || current_user || E'\\n' ||
                       'Connection Time: ' || now()::timestamp(0) || E'\\n' ||
                       'Database Size: ' || pg_size_pretty(pg_database_size(current_database())) || E'\\n' ||
                       'Active Connections: ' || (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database())::text;
                   \"" 2>/dev/null); then
        echo "$emr_status" | sed 's/^/  /'
    else
        echo "  Could not retrieve EMR database status"
    fi
    
    echo ""
    echo -e "${BLUE}🏥 EMR Healthcare Data Summary:${NC}"
    if data_summary=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                     "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c \"
                     SELECT 
                         'Patients' as record_type,
                         COUNT(*)::text as total_records,
                         pg_size_pretty(pg_total_relation_size('patients')) as table_size
                     FROM patients
                     UNION ALL
                     SELECT 
                         'Facilities' as record_type,
                         COUNT(*)::text as total_records,
                         pg_size_pretty(pg_total_relation_size('facilities')) as table_size
                     FROM facilities
                     UNION ALL
                     SELECT 
                         'Active Placements' as record_type,
                         COUNT(*)::text as total_records,
                         pg_size_pretty(pg_total_relation_size('placement_search')) as table_size
                     FROM placement_search 
                     WHERE status IN ('initiated', 'pending', 'approved')
                     UNION ALL
                     SELECT 
                         'Clinical Notes' as record_type,
                         COUNT(*)::text as total_records,
                         pg_size_pretty(pg_total_relation_size('placement_notes')) as table_size
                     FROM placement_notes
                     UNION ALL
                     SELECT 
                         'Audit Entries' as record_type,
                         COUNT(*)::text as total_records,
                         pg_size_pretty(pg_total_relation_size('audit_log')) as table_size
                     FROM audit_log;
                     \"" 2>/dev/null); then
        echo "$data_summary" | sed 's/^/  /'
    else
        echo "  Could not retrieve EMR data summary"
    fi
    
    echo ""
    echo -e "${BLUE}⚡ Recent EMR Activity (Last 24 Hours):${NC}"
    if recent_activity=$(ssh $ssh_opts -p "$SSH_PORT" -o ConnectTimeout=10 "$SSH_USER@$target_host" \
                        "psql -h localhost -U $DB_APP_USER -d $DB_NAME -c \"
                        SELECT 
                            table_name,
                            operation,
                            COUNT(*) as operations
                        FROM audit_log 
                        WHERE timestamp >= NOW() - INTERVAL '24 hours'
                        GROUP BY table_name, operation
                        ORDER BY operations DESC
                        LIMIT 10;
                        \"" 2>/dev/null); then
        echo "$recent_activity" | sed 's/^/  /'
    else
        echo "  No recent audit activity found"
    fi
}

# Function to connect to EMR database
connect_to_emr() {
    local connection_info=$1
    IFS=',' read -r network key <<< "$connection_info"
    
    if [[ "$network" == "tailscale" ]]; then
        target_host="$EMR_SERVER_TAILSCALE"
        connection_type="Tailscale VPN"
    elif [[ "$network" == "local" ]]; then
        target_host="$EMR_SERVER_LOCAL"
        connection_type="Local Network"
    else
        echo -e "${RED}❌ No working EMR connection found${NC}"
        show_emr_troubleshooting
        exit 1
    fi
    
    echo -e "${GREEN}✅ EMR connection method: ${connection_type}${NC}"
    echo -e "${GREEN}✅ Target host: ${target_host}${NC}"
    
    if [[ "$key" != "default" ]]; then
        echo -e "${GREEN}✅ SSH key: $(basename "$key")${NC}"
        ssh_opts="-i $key"
    else
        echo -e "${GREEN}✅ SSH key: default/ssh-agent${NC}"
        ssh_opts=""
    fi
    
    echo ""
    
    # Show EMR database status
    show_emr_status "$connection_info"
    
    echo ""
    echo -e "${GREEN}🎯 Connecting to EMR Database as Healthcare Application User!${NC}"
    echo ""
    echo -e "${BLUE}🏥 Healthcare-Specific Commands:${NC}"
    echo "  -- Patient Management"
    echo "  SELECT * FROM patients WHERE last_name = 'Smith';"
    echo "  SELECT COUNT(*) FROM patients;"
    echo ""
    echo "  -- Facility Search"
    echo "  SELECT * FROM facilities WHERE accepts_302 = true;"
    echo "  SELECT name, city, bed_count - current_census AS available_beds FROM facilities;"
    echo ""
    echo "  -- Placement Workflow"
    echo "  SELECT * FROM v_active_placement_searches ORDER BY priority_level DESC;"
    echo "  SELECT * FROM placement_search WHERE status = 'pending';"
    echo ""
    echo "  -- Clinical Documentation"
    echo "  SELECT * FROM placement_notes WHERE note_type = 'clinical' ORDER BY created_at DESC LIMIT 5;"
    echo ""
    echo "  -- HIPAA Audit Trail"
    echo "  SELECT * FROM audit_log WHERE table_name = 'patients' ORDER BY timestamp DESC LIMIT 10;"
    echo ""
    echo -e "${BLUE}📚 Standard PostgreSQL Commands:${NC}"
    echo "  \\dt                           # List all tables"
    echo "  \\d patients                  # Describe patients table"
    echo "  \\dv                          # List views"
    echo "  \\q                           # Quit"
    echo ""
    echo -e "${GREEN}✅ HIPAA Compliance: All operations are automatically logged to audit_log table${NC}"
    echo -e "${YELLOW}⚠️  Handle PHI (Protected Health Information) according to HIPAA guidelines${NC}"
    echo ""
    
    # Execute the EMR database connection via SSH
    echo -e "${BLUE}🚀 Establishing EMR database connection...${NC}"
    exec ssh $ssh_opts -p "$SSH_PORT" -t "$SSH_USER@$target_host" "psql -h localhost -U $DB_APP_USER -d $DB_NAME"
}

# Main execution
main() {
    echo -e "${BLUE}🔍 Initializing EMR healthcare application connection...${NC}"
    echo ""
    
    # Find working EMR connection
    if connection_info=$(find_emr_connection); then
        connect_to_emr "$connection_info"
    else
        show_emr_troubleshooting
        exit 1
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}EMR database connection cancelled by user${NC}"; exit 1' INT

# Run the EMR connection script
main "$@"