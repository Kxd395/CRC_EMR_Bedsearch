#!/bin/bash

# EMR Database IP Update Script
# Updates pg_hba.conf to allow current client IP address

echo "🔧 EMR Database Connection Fix"
echo "=============================="

# Get current IP
CURRENT_IP=$(curl -s ifconfig.me)
echo "📍 Your current IP: $CURRENT_IP"

# Database connection details
DB_HOST="100.112.67.23"
DB_USER="emr_admin"
DB_NAME="emr_crc_ssot"

echo ""
echo "🎯 Updating database to allow your IP address..."

# Create the SQL command to update pg_hba.conf
# This adds your current IP to the allowed hosts
SQL_COMMAND="
-- Add current client IP to pg_hba.conf
-- This allows the EMR application to connect from your current location

-- First, let's see current pg_hba entries
SELECT * FROM pg_hba_file_rules WHERE database @> '{emr_crc_ssot}';

-- Note: The actual pg_hba.conf file needs to be updated on the server
-- Add this line to /var/lib/postgresql/data/pg_hba.conf:
-- host    emr_crc_ssot    emr_admin    $CURRENT_IP/32    md5

-- Then reload PostgreSQL configuration:
-- SELECT pg_reload_conf();
"

echo "📝 SQL to execute on database server:"
echo "-------------------------------------"
echo "-- Allow IP: $CURRENT_IP"
echo "-- Add to pg_hba.conf:"
echo "host    emr_crc_ssot    emr_admin    $CURRENT_IP/32    md5"
echo ""
echo "-- Then reload config:"
echo "SELECT pg_reload_conf();"
echo ""

# Test current connection
echo "🔍 Testing current database connection..."
if command -v psql >/dev/null 2>&1; then
    echo "   Testing with psql..."
    # Load password from .env file securely
    if [ -f "src/api/.env" ]; then
        DB_PASSWORD=$(grep "DB_PASSWORD=" src/api/.env | cut -d'=' -f2)
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Connection successful!' as status, current_timestamp;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ Database connection works!"
        else
            echo "   ❌ Database connection failed - IP needs to be whitelisted"
            echo ""
            echo "🛠️  ACTION REQUIRED:"
            echo "   1. Connect to database server: ssh user@$DB_HOST"
            echo "   2. Edit: sudo nano /var/lib/postgresql/data/pg_hba.conf"
            echo "   3. Add line: host    emr_crc_ssot    emr_admin    $CURRENT_IP/32    md5"
            echo "   4. Reload: sudo systemctl reload postgresql"
            echo "   5. Or run: SELECT pg_reload_conf(); in postgres"
        fi
    else
        echo "   ⚠️  .env file not found - cannot load database credentials"
    fi
else
    echo "   ⚠️  psql not installed - install with: brew install postgresql"
    echo ""
    echo "🛠️  Manual fix required:"
    echo "   Database server needs to whitelist your IP: $CURRENT_IP"
fi

echo ""
echo "📋 Summary:"
echo "   • Current IP: $CURRENT_IP (was: 100.94.125.38)"
echo "   • Database: $DB_HOST:5432"
echo "   • Database name: $DB_NAME"
echo "   • User: $DB_USER"
echo ""
echo "💡 Once IP is whitelisted, restart the API server:"
echo "   cd $PROJECT_ROOT"
echo "   ./start-both-servers.sh"