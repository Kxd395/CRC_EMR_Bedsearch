# EMR Database System Configuration
# Working configuration for your deployed EMR system
# Created: September 30, 2025

# ===========================================
# SSH CONNECTION (WORKING)
# ===========================================
EMR_SERVER_HOST="100.112.67.23"
EMR_SERVER_PORT="2222"
EMR_SSH_USER="kxd395"
EMR_SSH_KEY="~/.ssh/id_ed25519_new"

# Full SSH connection command
EMR_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23"

# ===========================================
# DATABASE CONNECTION (DEPLOYED)
# ===========================================
EMR_DATABASE_NAME="emr_placement_ssot"
EMR_DATABASE_HOST="100.112.67.23"  
EMR_DATABASE_PORT="5432"
EMR_DATABASE_USER="postgres"

# Database connection via SSH
EMR_DB_COMMAND="sudo -u postgres psql -d emr_placement_ssot"

# ===========================================
# EMR SYSTEM DETAILS
# ===========================================
EMR_SYSTEM_STATUS="DEPLOYED"
EMR_VERSION="1.0.0"
POSTGRESQL_VERSION="16.10"

# Database Tables (5 core tables)
EMR_TABLES="patients,facilities,placement_search,placement_notes,audit_log"

# Current Data Counts (as of deployment)
PATIENTS_COUNT="2"
FACILITIES_COUNT="3"
HIPAA_COMPLIANT="true"

# ===========================================
# NETWORK INFORMATION  
# ===========================================
# Primary Network: Tailscale VPN
NETWORK_TYPE="tailscale_vpn"
TAILSCALE_IP="100.112.67.23"
LOCAL_IP="192.168.0.40"  # Local network (may not be accessible)

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
SSH_KEY_TYPE="ed25519"
SSH_PORT_CUSTOM="2222"  # Security: Non-standard port
PUBLIC_KEY_AUTH="enabled"
PASSWORD_AUTH="disabled"  # Security: Password auth disabled

# ===========================================
# HEALTHCARE COMPLIANCE
# ===========================================
HIPAA_AUDIT_LOGGING="enabled"
PHI_ENCRYPTION="enabled"
AUDIT_RETENTION_YEARS="7"

# ===========================================
# QUICK ACCESS COMMANDS
# ===========================================

# Test SSH connection:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 -o ConnectTimeout=10 kxd395@100.112.67.23 "echo 'Connection OK'"

# Access EMR database:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot"

# Check database tables:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot -c '\dt'"

# View patient records:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot -c 'SELECT * FROM patients;'"

# ===========================================
# USAGE EXAMPLES
# ===========================================

# Connect to server:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23

# One-line database query:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot -c 'SELECT COUNT(*) FROM patients;'"

# Interactive database session:
# ssh -i ~/.ssh/id_ed25519_new -p 2222 kxd395@100.112.67.23
# sudo -u postgres psql -d emr_placement_ssot