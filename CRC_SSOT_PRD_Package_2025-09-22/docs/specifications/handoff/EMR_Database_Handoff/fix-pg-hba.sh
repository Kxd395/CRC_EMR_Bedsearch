#!/bin/bash
# Fix PostgreSQL pg_hba.conf to allow Tailscale connections
# Run this ON THE LINUX SERVER (100.112.67.23)

echo "🔧 Fixing PostgreSQL pg_hba.conf for Tailscale access"
echo "========================================================"

# Your Mac's Tailscale IP
MAC_IP="100.94.125.38"

# Find pg_hba.conf location
PG_HBA_FILE=$(sudo find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)

if [ -z "$PG_HBA_FILE" ]; then
    echo "❌ Could not find pg_hba.conf"
    echo "Try: sudo find / -name pg_hba.conf"
    exit 1
fi

echo "📁 Found pg_hba.conf: $PG_HBA_FILE"

# Backup the file
echo "💾 Creating backup..."
sudo cp "$PG_HBA_FILE" "${PG_HBA_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Check if entry already exists
if sudo grep -q "$MAC_IP" "$PG_HBA_FILE"; then
    echo "✅ Entry for $MAC_IP already exists"
else
    echo "➕ Adding Tailscale network access..."
    
    # Add entry for entire Tailscale network (recommended)
    echo "" | sudo tee -a "$PG_HBA_FILE" > /dev/null
    echo "# Allow Tailscale network connections" | sudo tee -a "$PG_HBA_FILE" > /dev/null
    echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a "$PG_HBA_FILE" > /dev/null
    
    echo "✅ Added Tailscale network (100.64.0.0/10)"
fi

# Show the new configuration
echo ""
echo "📋 Current pg_hba.conf entries for emr_crc_ssot:"
sudo grep "emr_crc_ssot" "$PG_HBA_FILE"

# Restart PostgreSQL
echo ""
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Check status
echo ""
echo "📊 PostgreSQL Status:"
sudo systemctl status postgresql --no-pager | head -10

echo ""
echo "✅ DONE! PostgreSQL should now accept connections from your Mac ($MAC_IP)"
echo ""
echo "🧪 Test from your Mac with:"
echo "   psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
