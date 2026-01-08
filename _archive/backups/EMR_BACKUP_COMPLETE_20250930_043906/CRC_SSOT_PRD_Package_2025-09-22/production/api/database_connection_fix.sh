#!/bin/bash

# Database Connection Fix Script for PostgreSQL Server
# Run this script on the database server (100.112.67.23) as root or with sudo

echo "🔧 CRC SSOT Database Connection Fix"
echo "=================================="
echo "Current client IP: 100.94.125.38"
echo "Database server: 100.112.67.23"
echo "Database: emr_crc_ssot"
echo "User: emr_admin"
echo ""

# Backup current pg_hba.conf
echo "📋 Backing up current pg_hba.conf..."
sudo cp /etc/postgresql/16/main/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)

# Check if entry already exists
if sudo grep -q "100.94.125.38" /etc/postgresql/16/main/pg_hba.conf; then
    echo "⚠️  Entry for IP 100.94.125.38 already exists in pg_hba.conf"
    sudo grep "100.94.125.38" /etc/postgresql/16/main/pg_hba.conf
else
    echo "➕ Adding new pg_hba.conf entry for client IP..."
    
    # Add the specific host entry for the EMR application
    echo "# EMR CRC SSOT Application Access" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
    echo "host    emr_crc_ssot    emr_admin    100.94.125.38/32    md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
    echo "" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
fi

# Test configuration syntax
echo "🧪 Testing PostgreSQL configuration..."
sudo -u postgres pg_ctl reload -D /var/lib/postgresql/16/main

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL configuration reloaded successfully"
    echo ""
    echo "🔄 Testing database connection from client..."
    echo "Run this command on the client machine to test:"
    echo "psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c \"SELECT version();\""
    echo ""
    echo "🚀 If connection works, restart your EMR API server to use database instead of fallback"
else
    echo "❌ Failed to reload PostgreSQL configuration"
    echo "Restoring backup..."
    sudo cp /etc/postgresql/16/main/pg_hba.conf.backup.$(date +%Y%m%d) /etc/postgresql/16/main/pg_hba.conf
    exit 1
fi

echo ""
echo "📝 Current pg_hba.conf entries for emr_crc_ssot:"
sudo grep -n "emr_crc_ssot\|100.94.125.38" /etc/postgresql/16/main/pg_hba.conf

echo ""
echo "✅ Database connection fix completed!"
echo "The EMR application should now be able to connect to PostgreSQL"