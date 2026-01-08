#!/bin/bash

echo "=========================================="
echo "EMR Database Setup - Manual Process"
echo "=========================================="
echo ""
echo "SSH Key authentication is required. Here are your options:"
echo ""

echo "📋 **CURRENT SITUATION:**"
echo "   • SSH Server: 100.112.67.23:2222"
echo "   • User: kxd395"
echo "   • Authentication: Public key only"
echo "   • Current keys tested: All failed authentication"
echo ""

echo "🔧 **SOLUTION OPTIONS:**"
echo ""

echo "**Option 1: Generate New SSH Key and Add to Server**"
echo "----------------------------------------"
echo "1. Generate new key:"
echo "   ssh-keygen -t ed25519 -f ~/.ssh/emr_homelab -C 'emr-database-$(date +%Y%m%d)'"
echo ""
echo "2. You'll need physical access to the server to add the key:"
echo "   • Log into the Ubuntu server directly (keyboard/monitor)"
echo "   • Run: cat >> ~/.ssh/authorized_keys"
echo "   • Copy-paste the public key content (from ~/.ssh/emr_homelab.pub)"
echo "   • Press Ctrl+D to save"
echo ""
echo "3. Test the new key:"
echo "   ssh -i ~/.ssh/emr_homelab -p 2222 kxd395@100.112.67.23"
echo ""

echo "**Option 2: Enable Password Authentication Temporarily**"
echo "----------------------------------------"
echo "1. Log into the Ubuntu server directly (keyboard/monitor)"
echo "2. Edit SSH config:"
echo "   sudo nano /etc/ssh/sshd_config"
echo "3. Add or modify these lines:"
echo "   PasswordAuthentication yes"
echo "   PubkeyAuthentication yes"
echo "4. Restart SSH:"
echo "   sudo systemctl restart sshd"
echo "5. Test password login:"
echo "   ssh -p 2222 kxd395@100.112.67.23"
echo ""

echo "**Option 3: Use Existing Working SSH Connection**"
echo "----------------------------------------"
echo "Do you have an existing terminal session connected to the server?"
echo "If yes, you can run the database setup directly there."
echo ""

echo "**Option 4: Local Server Access**"
echo "----------------------------------------"
echo "If you're on the same local network (192.168.0.x), try:"
echo "   ssh kxd395@192.168.0.40"
echo "   # This might work if local SSH is configured differently"
echo ""

echo "=========================================="
echo "DATABASE SETUP SCRIPT (Ready to Run)"
echo "=========================================="
echo ""
echo "Once you have SSH access, copy and run this complete setup:"
echo ""

cat << 'SETUP_SCRIPT'
#!/bin/bash

echo "🔧 EMR Database Setup Script"
echo "Running on: $(hostname) as $(whoami)"
echo ""

# Step 1: Fix pg_hba.conf for Tailscale network
echo "Step 1: Configuring PostgreSQL access for Tailscale network..."
if ! sudo grep -q "100.64.0.0/10" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "  → Backing up pg_hba.conf..."
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "  → Adding Tailscale network whitelist..."
    echo "host    emr_crc_ssot    emr_admin       100.64.0.0/10           scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    
    echo "  → Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    echo "  ✅ pg_hba.conf updated successfully"
else
    echo "  ✅ Tailscale network already configured in pg_hba.conf"
fi

# Step 2: Ensure PostgreSQL is running
echo ""
echo "Step 2: Verifying PostgreSQL service..."
sudo systemctl start postgresql 2>/dev/null || true
if sudo systemctl is-active --quiet postgresql; then
    echo "  ✅ PostgreSQL is running"
else
    echo "  ❌ PostgreSQL is not running - attempting to start..."
    sudo systemctl start postgresql
    if sudo systemctl is-active --quiet postgresql; then
        echo "  ✅ PostgreSQL started successfully"
    else
        echo "  ❌ Failed to start PostgreSQL - check logs: sudo journalctl -u postgresql"
        exit 1
    fi
fi

# Step 3: Create database and user
echo ""
echo "Step 3: Setting up EMR database and user..."

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -t -c "SELECT 1 FROM pg_database WHERE datname='emr_crc_ssot';" | tr -d ' ')
if [ "$DB_EXISTS" != "1" ]; then
    echo "  → Creating database emr_crc_ssot..."
    sudo -u postgres createdb emr_crc_ssot
    echo "  ✅ Database created"
else
    echo "  ✅ Database emr_crc_ssot already exists"
fi

# Check if user exists
USER_EXISTS=$(sudo -u postgres psql -t -c "SELECT 1 FROM pg_user WHERE usename='emr_admin';" | tr -d ' ')
if [ "$USER_EXISTS" != "1" ]; then
    echo "  → Creating user emr_admin..."
    sudo -u postgres psql -c "CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';"
    echo "  ✅ User created"
else
    echo "  ✅ User emr_admin already exists"
fi

# Grant privileges
echo "  → Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;"
echo "  ✅ Privileges granted"

# Step 4: Check and apply schema
echo ""
echo "Step 4: Checking database schema..."

# Check if JSONB schema exists
SCHEMA_CHECK=$(sudo -u postgres psql -d emr_crc_ssot -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'searches';" 2>/dev/null | tr -d ' ')

if [ "$SCHEMA_CHECK" = "searches" ]; then
    echo "  ✅ JSONB schema already exists - skipping schema creation"
else
    echo "  → JSONB schema not found - creating complete EMR schema..."
    
    sudo -u postgres psql -d emr_crc_ssot << 'SQL_SCHEMA'
-- EMR Database Schema with JSONB for bed searches
-- Drop existing tables for fresh start
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS placement_notes CASCADE;
DROP TABLE IF EXISTS placement_search CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with JSONB schema for bed searches (SSOT Compliant)
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    id VARCHAR(50) UNIQUE,              -- Application ID (pt_xxx format)
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Clinical Assessment Information
    asam_level VARCHAR(10),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    admission_status VARCHAR(50),
    medical_acuity VARCHAR(100),
    
    -- MAT (Medication-Assisted Treatment) Needs
    mat_needs JSONB DEFAULT '{}',
    
    -- Insurance Information
    insurance_primary VARCHAR(200),
    insurance_secondary VARCHAR(200),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Bed Search Data (JSONB array for flexibility)
    searches JSONB DEFAULT '[]',
    
    -- Search History Timeline (JSONB array)
    search_history JSONB DEFAULT '[]',
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create facilities directory table
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
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id INTEGER,
    user_id VARCHAR(100),
    changed_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indexes
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_id ON patients(id);
CREATE INDEX idx_patients_searches ON patients USING GIN (searches);
CREATE INDEX idx_patients_search_history ON patients USING GIN (search_history);
CREATE INDEX idx_patients_updated_at ON patients(updated_at DESC);
CREATE INDEX idx_patients_asam ON patients(asam_level);
CREATE INDEX idx_patients_commitment ON patients(commitment_status);
CREATE INDEX idx_facilities_name ON facilities(facility_name);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);

-- Create auto-update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant all permissions to emr_admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;

SQL_SCHEMA

    echo "  ✅ JSONB schema created successfully"
fi

# Step 5: Final verification
echo ""
echo "Step 5: Final verification and permissions..."
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;"

echo ""
echo "=========================================="
echo "✅ EMR Database Setup Complete!"
echo "=========================================="
echo ""
echo "📊 Schema Summary:"
sudo -u postgres psql -d emr_crc_ssot -c "\dt"

echo ""
echo "🧪 Connection Test Commands (run from Mac):"
echo "PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
echo ""
echo "🏥 EMR Database is now ready for patient data with bed search tracking!"

SETUP_SCRIPT

echo ""
echo "=========================================="
echo "NEXT STEPS:"
echo "=========================================="
echo "1. Gain SSH access using one of the options above"
echo "2. Copy the entire script between the 'SETUP_SCRIPT' markers"
echo "3. Paste and run it on the Ubuntu server"
echo "4. Test the database connection from your Mac"
echo "5. Start your EMR API server"
echo ""
echo "The script is complete and ready - you just need SSH access!"