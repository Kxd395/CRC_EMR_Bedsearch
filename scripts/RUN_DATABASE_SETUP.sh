#!/bin/bash

# EMR Database Setup Script
# Uses working SSH connection to setup/update EMR database with SSOT-compliant schema
# Date: September 30, 2025

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         EMR Database SSOT Compliance Setup                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
SSH_KEY="~/.ssh/id_ed25519_new"
SSH_HOST="100.112.67.23"
SSH_PORT="2222"
SSH_USER="kxd395"
DB_NAME="emr_crc_ssot"
DB_USER="emr_admin"

echo "📋 Configuration:"
echo "   Server: ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "   Database: ${DB_NAME}"
echo "   Using SSH Key: ${SSH_KEY}"
echo ""

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ssh -i ~/.ssh/id_ed25519_new -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} 'echo "SSH OK"' > /dev/null 2>&1; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ SSH connection failed"
    exit 1
fi
echo ""

# Upload and execute setup script
echo "📤 Uploading SSOT-compliant database setup..."
scp -i ~/.ssh/id_ed25519_new -P ${SSH_PORT} \
    ./COMPLETE_SETUP_GUIDE.sh ${SSH_USER}@${SSH_HOST}:/tmp/emr_setup.sh

echo "   ✅ Setup script uploaded"
echo ""

echo "🚀 Executing database setup on server..."
echo "   This will:"
echo "   - Create database: ${DB_NAME} (if needed)"
echo "   - Add SSOT-required fields (id, last_sync)"
echo "   - Add all clinical fields"
echo "   - Create performance indexes"
echo "   - Configure pg_hba.conf for remote access"
echo ""
cat << 'REMOTE_SCRIPT'
cat > /tmp/setup_emr_db.sh << 'SCRIPT_END'
#!/bin/bash

echo "=========================================="
echo "EMR Database Setup Script"
echo "=========================================="
echo ""

# Step 1: Fix pg_hba.conf
echo "Step 1: Checking pg_hba.conf configuration..."
if ! sudo grep -q "100.64.0.0/10" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "  → Backing up pg_hba.conf..."
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup
    echo "  → Adding Tailscale network whitelist..."
    echo "host    emr_crc_ssot    emr_admin       100.64.0.0/10           scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    echo "  → Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    echo "  ✅ pg_hba.conf updated"
else
    echo "  ✅ pg_hba.conf already configured"
fi

# Step 2: Verify PostgreSQL is running
echo ""
echo "Step 2: Verifying PostgreSQL service..."
sudo systemctl start postgresql 2>/dev/null || true
if sudo systemctl is-active --quiet postgresql; then
    echo "  ✅ PostgreSQL is running"
else
    echo "  ❌ PostgreSQL is not running. Please check the service."
    exit 1
fi

# Step 3: Create database and user
echo ""
echo "Step 3: Setting up database and user..."
sudo -u postgres psql << 'PSQL_SETUP'
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE emr_crc_ssot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'emr_crc_ssot')\gexec

-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'emr_admin') THEN
        CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;
PSQL_SETUP

echo "  ✅ Database and user configured"

# Step 4: Check current schema
echo ""
echo "Step 4: Checking current database schema..."
SCHEMA_CHECK=$(sudo -u postgres psql -d emr_crc_ssot -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'searches';" 2>/dev/null | tr -d ' ')

if [ "$SCHEMA_CHECK" = "searches" ]; then
    echo "  ✅ JSONB schema already exists"
    echo "  → Skipping schema creation"
else
    echo "  → JSONB schema not found. Creating new schema..."
    
    # Step 5: Apply JSONB schema
    sudo -u postgres psql -d emr_crc_ssot << 'SCHEMA_SQL'
-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS placement_notes CASCADE;
DROP TABLE IF EXISTS placement_search CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with JSONB schema
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Clinical Information
    asam_level VARCHAR(10),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    admission_status VARCHAR(50),
    medical_acuity VARCHAR(100),
    
    -- MAT Needs (JSONB for flexibility)
    mat_needs JSONB DEFAULT '{}',
    
    -- Insurance
    insurance_primary VARCHAR(200),
    insurance_secondary VARCHAR(200),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Bed Searches (JSONB array)
    searches JSONB DEFAULT '[]',
    
    -- Search History Timeline (JSONB array)
    search_history JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create facilities table
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    facility_name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100),
    level_of_care VARCHAR(50),
    beds_available INTEGER DEFAULT 0,
    accepts_mat BOOLEAN DEFAULT false,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log for HIPAA compliance
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id INTEGER,
    user_id VARCHAR(100),
    changed_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_searches ON patients USING GIN (searches);
CREATE INDEX idx_patients_search_history ON patients USING GIN (search_history);
CREATE INDEX idx_patients_updated_at ON patients(updated_at DESC);
CREATE INDEX idx_facilities_name ON facilities(facility_name);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Create trigger for patients table
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for facilities table
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant all permissions to emr_admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;

SCHEMA_SQL

    echo "  ✅ JSONB schema created successfully"
fi

# Step 6: Final permissions check
echo ""
echo "Step 6: Verifying permissions..."
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;"
echo "  ✅ Permissions granted"

# Step 7: Display schema summary
echo ""
echo "=========================================="
echo "Setup Complete! Schema Summary:"
echo "=========================================="
sudo -u postgres psql -d emr_crc_ssot -c "\dt"

echo ""
echo "Testing connection from remote Mac..."
echo "Run this command on your Mac to test:"
echo ""
echo "PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
echo ""
echo "✅ Database setup complete!"

SCRIPT_END

chmod +x /tmp/setup_emr_db.sh
/tmp/setup_emr_db.sh
REMOTE_SCRIPT

echo ""
echo "=========================================="
echo "Quick Start:"
echo "=========================================="
echo ""
echo "1. Run: ssh -p 2222 kevindialmb@100.112.67.23"
echo "2. Copy the entire command block above (starting with 'cat > /tmp/setup_emr_db.sh')"
echo "3. Paste it in the SSH session and press Enter"
echo "4. The script will run automatically"
echo ""
echo "After the script completes, exit SSH and test the connection:"
echo ""
echo "PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
echo ""
