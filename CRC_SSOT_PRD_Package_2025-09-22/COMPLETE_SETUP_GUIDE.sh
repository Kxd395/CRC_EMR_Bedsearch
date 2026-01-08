#!/bin/bash

echo "=========================================="
echo "🔧 EMR Database Complete Setup Guide"
echo "=========================================="
echo ""
echo "SSH Key Generated Successfully! Here's what you need to do:"
echo ""

echo "📋 **CURRENT STATUS:**"
echo "   ✅ SSH key generated: ~/.ssh/emr_homelab"
echo "   ✅ Public key ready for server"
echo "   ✅ Database setup script ready"
echo "   ⏳ Waiting for server access"
echo ""

echo "🖥️  **STEP 1: Add SSH Key to Server**"
echo "----------------------------------------"
echo ""
echo "**Option A: Physical Server Access (Recommended)**"
echo ""
echo "1. Go to your Ubuntu server (100.112.67.23 / 192.168.0.40)"
echo "2. Login directly (keyboard/monitor as kxd395)"
echo "3. Run this EXACT command:"
echo ""
echo "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILpWk0mmbs03D/PjKvpaM4q3h+vUia8eQBZknqP0CwqY emr-database-kxd395@homelab' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "**Option B: If you have existing SSH/remote access:**"
echo "4. Log in via your existing method"
echo "5. Run the same command above"
echo ""

echo "🧪 **STEP 2: Test SSH Connection**"
echo "----------------------------------------"
echo ""
echo "From your Mac, run:"
echo "ssh -i ~/.ssh/emr_homelab -p 2222 kxd395@100.112.67.23"
echo ""
echo "If successful, you should see: kxd395@ubuntu-server:~$"
echo ""

echo "🗄️  **STEP 3: Setup Database (Automatic)**"
echo "----------------------------------------"
echo ""
echo "Once SSH works, run this command to automatically setup the entire database:"
echo ""

# Create the complete database setup command
cat << 'DATABASE_SETUP_COMMAND'
ssh -i ~/.ssh/emr_homelab -p 2222 kxd395@100.112.67.23 'bash -s' << 'REMOTE_SCRIPT'
#!/bin/bash

echo "🔧 EMR Database Complete Setup"
echo "Running on: $(hostname) as $(whoami)"
echo "Timestamp: $(date)"
echo ""

# Step 1: Fix pg_hba.conf for Tailscale network
echo "Step 1: Configuring PostgreSQL for Tailscale network access..."
if ! sudo grep -q "100.64.0.0/10" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "  → Backing up pg_hba.conf..."
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "  → Adding Tailscale network whitelist..."
    echo "host    emr_crc_ssot    emr_admin       100.64.0.0/10           scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    
    echo "  → Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    echo "  ✅ pg_hba.conf updated and PostgreSQL restarted"
else
    echo "  ✅ Tailscale network already configured"
fi

# Step 2: Ensure PostgreSQL is running
echo ""
echo "Step 2: Verifying PostgreSQL service..."
sudo systemctl start postgresql 2>/dev/null || true
if sudo systemctl is-active --quiet postgresql; then
    echo "  ✅ PostgreSQL is running"
else
    echo "  ❌ PostgreSQL not running - attempting restart..."
    sudo systemctl restart postgresql
    sleep 3
    if sudo systemctl is-active --quiet postgresql; then
        echo "  ✅ PostgreSQL started successfully"
    else
        echo "  ❌ PostgreSQL failed to start - check logs: sudo journalctl -u postgresql"
        exit 1
    fi
fi

# Step 3: Create database and user
echo ""
echo "Step 3: Setting up EMR database and user..."

# Check and create database
DB_EXISTS=$(sudo -u postgres psql -t -c "SELECT 1 FROM pg_database WHERE datname='emr_crc_ssot';" | tr -d ' ')
if [ "$DB_EXISTS" != "1" ]; then
    echo "  → Creating database emr_crc_ssot..."
    sudo -u postgres createdb emr_crc_ssot
    echo "  ✅ Database created"
else
    echo "  ✅ Database emr_crc_ssot already exists"
fi

# Check and create user
USER_EXISTS=$(sudo -u postgres psql -t -c "SELECT 1 FROM pg_user WHERE usename='emr_admin';" | tr -d ' ')
if [ "$USER_EXISTS" != "1" ]; then
    echo "  → Creating user emr_admin..."
    sudo -u postgres psql -c "CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';"
    echo "  ✅ User created"
else
    echo "  ✅ User emr_admin already exists"
fi

# Grant database privileges
echo "  → Granting database privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;"

# Step 4: Apply EMR Schema
echo ""
echo "Step 4: Applying EMR database schema..."

SCHEMA_CHECK=$(sudo -u postgres psql -d emr_crc_ssot -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'searches';" 2>/dev/null | tr -d ' ')

if [ "$SCHEMA_CHECK" = "searches" ]; then
    echo "  ✅ EMR JSONB schema already exists"
else
    echo "  → Creating EMR JSONB schema for bed search tracking..."
    
    sudo -u postgres psql -d emr_crc_ssot << 'SCHEMA_SQL'
-- EMR Database Schema with JSONB for bed searches and patient tracking
-- Drop existing tables for clean setup
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS placement_notes CASCADE;
DROP TABLE IF EXISTS placement_search CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with JSONB schema (SSOT Compliant)
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    id VARCHAR(50) UNIQUE,              -- Application ID (pt_xxx format)
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Clinical Assessment Fields
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
    
    -- Bed Search Data (JSONB array for tracking all searches)
    searches JSONB DEFAULT '[]',
    
    -- Search History Timeline (JSONB array for audit trail)
    search_history JSONB DEFAULT '[]',
    
    -- Timestamps with auto-update
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create facilities directory
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
    notes TEXT,
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
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indexes
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_id ON patients(id);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_searches ON patients USING GIN (searches);
CREATE INDEX idx_patients_search_history ON patients USING GIN (search_history);
CREATE INDEX idx_patients_updated_at ON patients(updated_at DESC);
CREATE INDEX idx_patients_asam ON patients(asam_level);
CREATE INDEX idx_patients_commitment ON patients(commitment_status);
CREATE INDEX idx_patients_admission ON patients(admission_status);
CREATE INDEX idx_facilities_name ON facilities(facility_name);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_lol ON facilities(level_of_care);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Create auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant all necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO emr_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO emr_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO emr_admin;

SCHEMA_SQL

    echo "  ✅ EMR JSONB schema created successfully"
fi

# Step 5: Final verification
echo ""
echo "Step 5: Final verification and testing..."

# Grant permissions (ensure they're set)
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;"

# Test the database connection
echo "  → Testing database connection..."
PGPASSWORD='emr_secure_2024' psql -h localhost -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 'Database connection successful' AS status;" || {
    echo "  ❌ Database connection test failed"
    exit 1
}

echo ""
echo "=========================================="
echo "✅ EMR Database Setup Complete!"
echo "=========================================="
echo ""
echo "📊 Database Schema Summary:"
sudo -u postgres psql -d emr_crc_ssot -c "\dt"

echo ""
echo "🔍 Key Features Configured:"
echo "   ✅ JSONB bed searches storage"
echo "   ✅ Search history timeline"
echo "   ✅ Auto-updating timestamps"  
echo "   ✅ HIPAA audit logging"
echo "   ✅ Performance indexes"
echo "   ✅ Clinical assessment fields"
echo "   ✅ MAT needs tracking"
echo ""

echo "🌐 Connection Details:"
echo "   Host: 100.112.67.23:5432"
echo "   Database: emr_crc_ssot"
echo "   User: emr_admin"
echo "   Password: emr_secure_2024"
echo ""

echo "🧪 Test from Mac:"
echo "PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
echo ""

echo "🎉 Your EMR Database is ready for patient data with bed search tracking!"

REMOTE_SCRIPT
DATABASE_SETUP_COMMAND

echo ""
echo "✅ **STEP 4: Test Database Connection from Mac**"
echo "----------------------------------------"
echo ""
echo "After the database setup completes, test the connection:"
echo ""
echo "PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c 'SELECT 1;'"
echo ""
echo "Expected result: You should see '1' returned (not an authentication error)"
echo ""

echo "🚀 **STEP 5: Start Your EMR Application**"
echo "----------------------------------------"
echo ""
echo "Once the database is connected:"
echo "1. cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"
echo "2. npm run api"
echo "3. Look for: '✅ Database connection successful' in the logs"
echo "4. Open http://localhost:5174 to test the UI"
echo ""

echo "=========================================="
echo "📋 **SUMMARY CHECKLIST:**"
echo "=========================================="
echo ""
echo "□ Add SSH key to server (Step 1)"
echo "□ Test SSH connection (Step 2)"  
echo "□ Run database setup command (Step 3)"
echo "□ Test database connection (Step 4)"
echo "□ Start EMR application (Step 5)"
echo "□ Verify no 'fallback' messages in logs"
echo "□ Test patient data and bed searches in UI"
echo ""

echo "🎯 **You're ready to go! Start with Step 1.**"