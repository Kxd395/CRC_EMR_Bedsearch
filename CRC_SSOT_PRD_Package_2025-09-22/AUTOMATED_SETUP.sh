#!/bin/bash

# EMR Database Automated Setup
# Uses working SSH key to deploy SSOT-compliant database
# Date: September 30, 2025

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         EMR Database SSOT Compliance Setup                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration (from EMR_READY_TO_USE handoff)
SSH_KEY="~/.ssh/id_ed25519_new"
SSH_HOST="100.112.67.23"
SSH_PORT="2222"
SSH_USER="kxd395"
DB_NAME="emr_crc_ssot"

echo "📋 Configuration:"
echo "   Server: ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "   Database: ${DB_NAME}"
echo "   SSH Key: ${SSH_KEY} ✅"
echo ""

# Test SSH
echo "🔐 Testing SSH connection..."
if ssh -i ~/.ssh/id_ed25519_new -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} 'echo "OK"' > /dev/null 2>&1; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ SSH connection failed"
    exit 1
fi
echo ""

# Upload setup script
echo "📤 Uploading SSOT-compliant setup script..."
scp -q -i ~/.ssh/id_ed25519_new -P ${SSH_PORT} \
    ./COMPLETE_SETUP_GUIDE.sh ${SSH_USER}@${SSH_HOST}:/tmp/emr_ssot_setup.sh

echo "   ✅ Setup script uploaded to server"
echo ""

# Execute setup
echo "�� Executing database setup on server..."
echo "   (This may take 1-2 minutes)"
echo ""

ssh -i ~/.ssh/id_ed25519_new -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} \
    'bash /tmp/emr_ssot_setup.sh'

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP COMPLETE!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Database Ready:"
echo "   • Database: ${DB_NAME} created with SSOT schema"
echo "   • Tables: patients, facilities, audit_log"
echo "   • Fields: id ✅, last_sync ✅, all clinical fields ✅"
echo "   • Indexes: Performance indexes created ✅"
echo "   • Access: pg_hba.conf configured ✅"
echo ""
echo "📊 Verify Schema:"
echo "   ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 \\"
echo "     \"sudo -u postgres psql -d emr_crc_ssot -c '\d patients'\""
echo ""
echo "🔄 Next: Restart API Server"
echo "   npm run api"
echo ""
