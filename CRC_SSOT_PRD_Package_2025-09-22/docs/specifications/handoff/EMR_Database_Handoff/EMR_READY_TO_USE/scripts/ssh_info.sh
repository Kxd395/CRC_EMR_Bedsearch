#!/bin/bash
# SSH Connection Info and Setup
# Your working SSH configuration for EMR database access
# Version: 1.0.0
# Created: September 30, 2025

echo "🔑 EMR Database SSH Connection Information"
echo "========================================"
echo ""

# Your Working SSH Configuration
echo "✅ WORKING SSH SETUP:"
echo "Server: 100.112.67.23 (Tailscale VPN)"
echo "Port: 2222"  
echo "User: kxd395"
echo "SSH Key: ~/.ssh/id_ed25519_new"
echo "Database: emr_placement_ssot"
echo ""

# Direct connection command
echo "🔗 DIRECT CONNECTION:"
echo "ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23"
echo ""

# Database access command  
echo "🗄️  DATABASE ACCESS:"
echo "ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 'sudo -u postgres psql -d emr_placement_ssot'"
echo ""

# Your SSH key info
echo "🔐 SSH KEY INFORMATION:"
echo "Private Key: ~/.ssh/id_ed25519_new"
echo "Public Key: ~/.ssh/id_ed25519_new.pub"

if [[ -f "${HOME}/.ssh/id_ed25519_new.pub" ]]; then
    echo ""
    echo "📋 YOUR PUBLIC KEY (for reference):"
    echo "$(cat "${HOME}/.ssh/id_ed25519_new.pub")"
else
    echo "⚠️  Public key file not found"
fi

echo ""
echo "🧪 CONNECTION TEST:"
if ssh -i ~/.ssh/id_ed25519_new -p 2222 -o ConnectTimeout=10 -o BatchMode=yes kxd395@100.112.67.23 "echo 'Test successful'" 2>/dev/null; then
    echo "✅ SSH Connection: WORKING"
else
    echo "❌ SSH Connection: FAILED"
    echo ""
    echo "🔧 TROUBLESHOOTING:"
    echo "1. Check if Tailscale is running: tailscale status"
    echo "2. Test network connectivity: ping 100.112.67.23"
    echo "3. Verify SSH key permissions: ls -la ~/.ssh/id_ed25519_new*"
    echo "4. Manual connection test: ssh -vvv -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23"
fi

echo ""
echo "📚 QUICK REFERENCE:"
echo "• Use scripts/connect_emr.sh for interactive access"
echo "• Use scripts/emr_management.sh for database management"
echo "• Server runs PostgreSQL 16.10 with EMR schema deployed"
echo "• Database includes: patients, facilities, placement_search, placement_notes, audit_log"