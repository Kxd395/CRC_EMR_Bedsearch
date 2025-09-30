#!/bin/bash

# Remote Database pg_hba.conf Update Script
# This script connects to the database server and updates the IP whitelist

echo "🔧 Updating Remote Database IP Whitelist"
echo "========================================"

DB_HOST="100.112.67.23"
NEW_IP="70.16.142.31"
OLD_IP="100.94.125.38"

echo "📍 New IP to whitelist: $NEW_IP"
echo "📍 Old IP to remove: $OLD_IP"
echo ""

# Check if we have SSH access to the database server
echo "🔗 Attempting to connect to database server..."

# Method 1: Try direct PostgreSQL admin connection
echo "   Method 1: Direct PostgreSQL connection..."

# Load credentials from .env
if [ -f "src/api/.env" ]; then
    DB_PASSWORD=$(grep "DB_PASSWORD=" src/api/.env | cut -d'=' -f2)
    
    # Try to connect as postgres superuser to modify pg_hba.conf
    if command -v psql >/dev/null 2>&1; then
        echo "   Attempting to update pg_hba.conf via SQL..."
        
        # Create SQL script to reload config
        cat > temp_update_hba.sql << EOF
-- Update pg_hba.conf to allow new IP
-- Note: This requires the pg_hba.conf file to be manually edited on the server
-- Current IP that needs access: $NEW_IP

-- First, let's see what's currently configured
SELECT line_number, type, database, user_name, address, auth_method, error
FROM pg_hba_file_rules 
WHERE database @> '{emr_crc_ssot}' OR database @> '{all}'
ORDER BY line_number;

-- Check current connections
SELECT client_addr, usename, datname, state, query_start
FROM pg_stat_activity 
WHERE datname = 'emr_crc_ssot';

-- Test if we can reload configuration (requires superuser)
SELECT pg_reload_conf() as config_reloaded;
EOF

        echo "   Executing configuration check..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "emr_admin" -d "emr_crc_ssot" -f temp_update_hba.sql 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Connected successfully!"
        else
            echo "   ❌ Connection failed - manual intervention required"
        fi
        
        rm -f temp_update_hba.sql
    fi
    
    echo ""
    echo "🛠️  REQUIRED: Manual Database Server Update"
    echo "==========================================="
    echo ""
    echo "The database administrator needs to:"
    echo ""
    echo "1. SSH to database server:"
    echo "   ssh admin@$DB_HOST"
    echo ""
    echo "2. Edit pg_hba.conf file:"
    echo "   sudo nano /etc/postgresql/*/main/pg_hba.conf"
    echo "   # OR"
    echo "   sudo nano /var/lib/postgresql/data/pg_hba.conf"
    echo ""
    echo "3. Add/update this line:"
    echo "   host    emr_crc_ssot    emr_admin    $NEW_IP/32    md5"
    echo ""
    echo "4. Remove old IP entry (if exists):"
    echo "   # host    emr_crc_ssot    emr_admin    $OLD_IP/32    md5"
    echo ""
    echo "5. Reload PostgreSQL configuration:"
    echo "   sudo systemctl reload postgresql"
    echo "   # OR in psql as superuser:"
    echo "   SELECT pg_reload_conf();"
    echo ""
    echo "6. Verify the change:"
    echo "   sudo tail -f /var/log/postgresql/postgresql-*.log"
    echo ""
    
else
    echo "   ❌ Cannot find .env file with database credentials"
fi

echo ""
echo "🔍 After database update, test with:"
echo "   ./fix-database-connection.sh"
echo ""
echo "✅ Then restart servers:"
echo "   ./start-both-servers.sh"