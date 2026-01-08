#!/bin/bash

# Fix Database Connection Script for CRC SSOT EMR
# This script updates PostgreSQL configuration to allow connections from your current IP

echo "🔧 Fixing PostgreSQL Database Connection..."
echo "📡 Current connecting IP: 100.94.125.38"

# Backup existing pg_hba.conf
sudo cp /etc/postgresql/16/main/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up existing pg_hba.conf"

# Add connection entry for your IP
echo "# EMR CRC SSOT Client Connection - Added $(date)" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
echo "host    emr_crc_ssot    emr_admin    100.94.125.38/32    md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
echo "✅ Added connection entry for IP 100.94.125.38"

# Restart PostgreSQL service
sudo systemctl restart postgresql
echo "🔄 Restarted PostgreSQL service"

# Test the connection
echo "🧪 Testing database connection..."
sudo -u postgres psql -d emr_crc_ssot -c "SELECT 'Connection successful!' as status, COUNT(*) as patient_count FROM patients;"

# Show service status
sudo systemctl status postgresql --no-pager -l

echo ""
echo "✅ Database connection fix complete!"
echo "🌐 Your EMR system should now be able to connect to the database"
echo "🔗 Test connection from your app with: http://localhost:3001/api/patients"