#!/bin/bash

# 🔧 PostgreSQL Database Connection Fix for CRC SSOT EMR
# Run this script on your database server (100.112.67.23) as root

echo "🏥 CRC SSOT EMR Database Connection Fix"
echo "========================================"
echo "📡 Allowing connections from IP: 100.94.125.38"
echo "🗄️  Database: emr_crc_ssot"
echo "👤 User: emr_admin"
echo ""

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "❌ PostgreSQL is not running. Starting it..."
    systemctl start postgresql
    sleep 5
fi

# Check PostgreSQL version and config location
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | head -1 | awk '{print $2}' | cut -d. -f1)
echo "🐘 PostgreSQL version: $PG_VERSION"

# Find the correct config path
if [ -f "/etc/postgresql/16/main/pg_hba.conf" ]; then
    PG_CONFIG_PATH="/etc/postgresql/16/main"
elif [ -f "/etc/postgresql/15/main/pg_hba.conf" ]; then
    PG_CONFIG_PATH="/etc/postgresql/15/main"
elif [ -f "/etc/postgresql/14/main/pg_hba.conf" ]; then
    PG_CONFIG_PATH="/etc/postgresql/14/main"
else
    echo "❌ Could not find PostgreSQL configuration directory"
    exit 1
fi

echo "📁 Config path: $PG_CONFIG_PATH"

# Create backup
BACKUP_FILE="$PG_CONFIG_PATH/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup: $BACKUP_FILE"
cp "$PG_CONFIG_PATH/pg_hba.conf" "$BACKUP_FILE"

# Check if entry already exists
if grep -q "100.94.125.38.*emr_crc_ssot.*emr_admin" "$PG_CONFIG_PATH/pg_hba.conf"; then
    echo "✅ Connection entry already exists in pg_hba.conf"
else
    echo "➕ Adding connection entry to pg_hba.conf..."
    
    # Add the new entry before the default entries
    sed -i '/# Database administrative login by Unix domain socket/i\
# CRC SSOT EMR - Allow connection from client IP\
host    emr_crc_ssot    emr_admin       100.94.125.38/32        md5\
' "$PG_CONFIG_PATH/pg_hba.conf"
    
    echo "✅ Added connection entry for 100.94.125.38"
fi

# Check postgresql.conf for listen_addresses
echo "🔍 Checking PostgreSQL listen configuration..."
if grep -q "#listen_addresses = 'localhost'" "$PG_CONFIG_PATH/postgresql.conf"; then
    echo "🔧 Updating listen_addresses to allow external connections..."
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONFIG_PATH/postgresql.conf"
elif grep -q "listen_addresses = 'localhost'" "$PG_CONFIG_PATH/postgresql.conf"; then
    echo "🔧 Updating listen_addresses to allow external connections..."
    sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONFIG_PATH/postgresql.conf"
else
    echo "✅ listen_addresses already configured for external connections"
fi

# Restart PostgreSQL to apply changes
echo "🔄 Restarting PostgreSQL to apply changes..."
systemctl restart postgresql

# Wait for PostgreSQL to start
echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

# Verify the service is running
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL restarted successfully"
else
    echo "❌ PostgreSQL failed to restart"
    exit 1
fi

# Test the connection
echo "🧪 Testing database connection..."
export PGPASSWORD="emr_secure_2024"
if psql -h localhost -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 'Connection test successful' as result;" > /dev/null 2>&1; then
    echo "✅ Local database connection test successful"
else
    echo "⚠️  Local connection test failed - check password or database setup"
fi

# Show current connections allowed
echo ""
echo "📋 Current pg_hba.conf entries for emr_crc_ssot:"
grep -E "(emr_crc_ssot|^# TYPE)" "$PG_CONFIG_PATH/pg_hba.conf" | head -10

echo ""
echo "🎉 Database configuration updated!"
echo "💡 Your CRC SSOT EMR app should now connect to the database instead of fallback files"
echo ""
echo "🔗 Test connection from your app:"
echo "   curl http://localhost:3001/health"
echo ""