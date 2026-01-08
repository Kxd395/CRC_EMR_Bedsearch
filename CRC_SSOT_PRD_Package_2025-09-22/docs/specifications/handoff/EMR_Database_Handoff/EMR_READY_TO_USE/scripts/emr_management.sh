#!/bin/bash
# EMR Database Management Script  
# Complete management tools for your EMR database system
# Version: 1.0.0
# Created: September 30, 2025

set -euo pipefail

# Configuration
EMR_SERVER="100.112.67.23"
SSH_PORT="2222"
SSH_USER="kxd395"
SSH_KEY="${HOME}/.ssh/id_ed25519_new"
DATABASE="emr_placement_ssot"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🏥 EMR Database Management System${NC}"
echo "====================================="
echo "Server: ${EMR_SERVER}"
echo "Database: ${DATABASE}"
echo "Timestamp: $(date)"
echo ""

# Function to test connection
test_connection() {
    echo -e "${YELLOW}Testing EMR database connection...${NC}"
    if ssh -i "${SSH_KEY}" -p "${SSH_PORT}" -o ConnectTimeout=10 -o BatchMode=yes "${SSH_USER}@${EMR_SERVER}" "echo 'Connection test successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ Connection: SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}❌ Connection: FAILED${NC}"
        return 1
    fi
}

# Function to show database schema
show_schema() {
    echo -e "${CYAN}📋 EMR Database Schema:${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c '
        SELECT 
            schemaname,
            tablename,
            tableowner
        FROM pg_tables 
        WHERE schemaname = '\''public'\'' 
        ORDER BY tablename;'
    "
}

# Function to show record counts
show_counts() {
    echo -e "${CYAN}📊 Record Counts:${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c '
        SELECT '\''patients'\'' as table_name, COUNT(*) as records FROM patients
        UNION ALL
        SELECT '\''facilities'\'', COUNT(*) FROM facilities  
        UNION ALL
        SELECT '\''placement_search'\'', COUNT(*) FROM placement_search
        UNION ALL
        SELECT '\''placement_notes'\'', COUNT(*) FROM placement_notes
        UNION ALL
        SELECT '\''audit_log'\'', COUNT(*) FROM audit_log
        ORDER BY table_name;'
    "
}

# Function to backup database
backup_database() {
    local backup_file="emr_backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${YELLOW}💾 Creating database backup: ${backup_file}${NC}"
    
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres pg_dump -d ${DATABASE} --clean --if-exists > /tmp/${backup_file}
        echo 'Backup created: /tmp/${backup_file}'
        ls -lh /tmp/${backup_file}
    "
    
    echo -e "${GREEN}✅ Backup completed${NC}"
}

# Function to show recent audit logs
show_audit_logs() {
    echo -e "${CYAN}📝 Recent Audit Logs (Last 10):${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c '
        SELECT 
            log_timestamp,
            user_id,
            action_type,
            table_name,
            record_id
        FROM audit_log 
        ORDER BY log_timestamp DESC 
        LIMIT 10;'
    "
}

# Function to add a new patient (example)
add_sample_patient() {
    echo -e "${YELLOW}👥 Adding sample patient...${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c \"
        INSERT INTO patients (
            first_name, 
            last_name, 
            date_of_birth, 
            gender, 
            insurance_type,
            emergency_contact_name,
            emergency_contact_phone,
            created_at
        ) VALUES (
            'Test', 
            'Patient', 
            '1990-01-01', 
            'M', 
            'medicaid',
            'Emergency Contact',
            '555-0123',
            NOW()
        ) RETURNING patient_id, first_name, last_name;\"
    "
    echo -e "${GREEN}✅ Sample patient added${NC}"
}

# Function to search facilities
search_facilities() {
    echo -e "${CYAN}🏥 Healthcare Facilities:${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c '
        SELECT 
            facility_id,
            name,
            city,
            state,
            CASE WHEN accepts_302 THEN '\''Yes'\'' ELSE '\''No'\'' END as \"302 Hold\",
            CASE WHEN accepts_mat THEN '\''Yes'\'' ELSE '\''No'\'' END as \"MAT Treatment\",
            bed_capacity
        FROM facilities 
        ORDER BY name;'
    "
}

# Function to monitor database performance
monitor_performance() {
    echo -e "${CYAN}⚡ Database Performance:${NC}"
    ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
        sudo -u postgres psql -d ${DATABASE} -c '
        SELECT 
            datname as database,
            numbackends as connections,
            xact_commit as commits,
            xact_rollback as rollbacks,
            blks_read as blocks_read,
            blks_hit as blocks_hit,
            ROUND((blks_hit::float / (blks_hit + blks_read + 1)) * 100, 2) as cache_hit_ratio
        FROM pg_stat_database 
        WHERE datname = '\''${DATABASE}'\'';'
    "
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1.  📊 Show Database Schema"
    echo "2.  🔢 Show Record Counts"  
    echo "3.  👥 View All Patients"
    echo "4.  🏥 Search Facilities"
    echo "5.  📝 View Audit Logs"
    echo "6.  💾 Backup Database"
    echo "7.  👤 Add Sample Patient"
    echo "8.  ⚡ Monitor Performance"
    echo "9.  🔗 Direct Database Connection"
    echo "10. 🖥️  SSH to Server"
    echo "0.  ❌ Exit"
    echo ""
}

# Test connection first
if ! test_connection; then
    echo -e "${RED}❌ Cannot connect to EMR database server${NC}"
    echo "Check: ssh -i ${SSH_KEY} -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER}"
    exit 1
fi

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (0-10): " choice
    echo ""
    
    case $choice in
        1) show_schema ;;
        2) show_counts ;;
        3) 
            echo -e "${CYAN}👥 All Patients:${NC}"
            ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
                sudo -u postgres psql -d ${DATABASE} -c 'SELECT patient_id, first_name, last_name, date_of_birth, gender, insurance_type FROM patients ORDER BY patient_id;'
            "
            ;;
        4) search_facilities ;;
        5) show_audit_logs ;;
        6) backup_database ;;
        7) add_sample_patient ;;
        8) monitor_performance ;;
        9) 
            echo -e "${CYAN}🔗 Opening direct database connection...${NC}"
            echo "Type \\q to exit the database connection"
            ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "sudo -u postgres psql -d ${DATABASE}"
            ;;
        10)
            echo -e "${CYAN}🖥️  Opening SSH connection to server...${NC}"
            ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}"
            ;;
        0)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done