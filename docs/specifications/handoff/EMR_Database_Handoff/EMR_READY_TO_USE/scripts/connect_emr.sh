#!/bin/bash
# EMR Database Quick Connect Script
# Uses your working SSH key to connect to the EMR database
# Version: 1.0.0
# Created: September 30, 2025

set -euo pipefail

# Configuration - Using your working SSH setup
EMR_SERVER="100.112.67.23"
SSH_PORT="2222"
SSH_USER="kxd395"
SSH_KEY="${HOME}/.ssh/id_ed25519_new"
DATABASE="emr_placement_ssot"

echo "🏥 EMR Database Quick Connect"
echo "============================"
echo "Server: ${EMR_SERVER}"
echo "Database: ${DATABASE}"
echo "Timestamp: $(date)"
echo ""

# Quick connection test
if ssh -i "${SSH_KEY}" -p "${SSH_PORT}" -o ConnectTimeout=10 -o BatchMode=yes "${SSH_USER}@${EMR_SERVER}" "echo 'Connection OK'" 2>/dev/null; then
    echo "✅ SSH Connection: WORKING"
else
    echo "❌ SSH Connection: FAILED"
    echo "Check: ssh -i ${SSH_KEY} -p ${SSH_PORT} ${SSH_USER}@${EMR_SERVER}"
    exit 1
fi

# Database connection options
echo ""
echo "Choose your connection method:"
echo "1. Connect to EMR Database (PostgreSQL)"
echo "2. SSH to Ubuntu Server"
echo "3. Check EMR Database Status"
echo "4. View Patient Records"
echo "5. View Facilities"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🔗 Connecting to EMR Database..."
        ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "sudo -u postgres psql -d ${DATABASE}"
        ;;
    2)
        echo "🖥️  Connecting to Ubuntu Server..."
        ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}"
        ;;
    3)
        echo "📊 EMR Database Status..."
        ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
            echo '=== EMR Database Status ==='
            sudo -u postgres psql -d ${DATABASE} -c '\\dt'
            echo ''
            echo '=== Record Counts ==='
            sudo -u postgres psql -d ${DATABASE} -c 'SELECT COUNT(*) as patients FROM patients; SELECT COUNT(*) as facilities FROM facilities; SELECT COUNT(*) as placements FROM placement_search;'
        "
        ;;
    4)
        echo "👥 Patient Records..."
        ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
            sudo -u postgres psql -d ${DATABASE} -c 'SELECT patient_id, first_name, last_name, date_of_birth, insurance_type FROM patients;'
        "
        ;;
    5)
        echo "🏥 Healthcare Facilities..."
        ssh -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${EMR_SERVER}" "
            sudo -u postgres psql -d ${DATABASE} -c 'SELECT facility_id, name, city, state, accepts_302, accepts_mat FROM facilities;'
        "
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac