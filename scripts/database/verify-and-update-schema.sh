#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# EMR Database Schema Verification & Update Script
# ═══════════════════════════════════════════════════════════════════════════
# Purpose: Verify current schema and apply JSONB schema if needed
# Run From: Linux server (100.112.67.23) after SSH
# SSH Command: ssh -p 2222 kevindialmb@100.112.67.23
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════════════"
echo "EMR Database Schema Verification & Update"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 1: Fix pg_hba.conf (if not already done)
# ───────────────────────────────────────────────────────────────────────────

echo "Step 1: Checking pg_hba.conf configuration..."

# Check if Tailscale entry exists
if sudo grep -q "100.64.0.0/10" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "✅ pg_hba.conf already has Tailscale entry"
else
    echo "⚠️  Adding Tailscale network to pg_hba.conf..."
    
    # Backup first
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
    
    # Add entry
    echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    
    # Restart PostgreSQL
    sudo systemctl restart postgresql
    
    echo "✅ pg_hba.conf updated and PostgreSQL restarted"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 2: Verify PostgreSQL is running
# ───────────────────────────────────────────────────────────────────────────

echo "Step 2: Verifying PostgreSQL service..."

if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running. Starting..."
    sudo systemctl start postgresql
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 3: Verify database and user exist
# ───────────────────────────────────────────────────────────────────────────

echo "Step 3: Verifying database and user..."

# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw emr_crc_ssot; then
    echo "✅ Database 'emr_crc_ssot' exists"
else
    echo "⚠️  Creating database 'emr_crc_ssot'..."
    sudo -u postgres psql -c "CREATE DATABASE emr_crc_ssot;"
    echo "✅ Database created"
fi

# Check if user exists
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='emr_admin'" | grep -q 1; then
    echo "✅ User 'emr_admin' exists"
else
    echo "⚠️  Creating user 'emr_admin'..."
    sudo -u postgres psql -c "CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';"
    echo "✅ User created"
fi

# Grant permissions
echo "Granting permissions..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON SCHEMA public TO emr_admin;"

echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 4: Check current schema
# ───────────────────────────────────────────────────────────────────────────

echo "Step 4: Checking current database schema..."
echo ""

# List all tables
echo "Current tables:"
sudo -u postgres psql -d emr_crc_ssot -c "\dt"

echo ""

# Check patients table structure if it exists
if sudo -u postgres psql -d emr_crc_ssot -tAc "SELECT to_regclass('patients')" | grep -q patients; then
    echo "Patients table columns:"
    sudo -u postgres psql -d emr_crc_ssot -c "\d patients"
    
    echo ""
    
    # Check if searches column exists (JSONB schema)
    if sudo -u postgres psql -d emr_crc_ssot -tAc "SELECT column_name FROM information_schema.columns WHERE table_name='patients' AND column_name='searches'" | grep -q searches; then
        echo "✅ JSONB Schema detected - 'searches' column exists"
        SCHEMA_TYPE="JSONB"
    else
        echo "⚠️  Normalized Schema detected - 'searches' column NOT found"
        SCHEMA_TYPE="NORMALIZED"
    fi
else
    echo "⚠️  Patients table does not exist - database is empty"
    SCHEMA_TYPE="EMPTY"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 5: Apply JSONB schema if needed
# ───────────────────────────────────────────────────────────────────────────

echo "Step 5: Schema update decision..."
echo ""

if [ "$SCHEMA_TYPE" = "JSONB" ]; then
    echo "✅ Database already has JSONB schema - no update needed"
    echo ""
    echo "Verifying all required columns exist..."
    
    REQUIRED_COLUMNS=(
        "searches"
        "search_history"
        "asam_level"
        "level_of_care"
        "commitment_status"
        "admission_status"
        "mat_needs"
        "updated_at"
    )
    
    MISSING_COLUMNS=()
    
    for col in "${REQUIRED_COLUMNS[@]}"; do
        if sudo -u postgres psql -d emr_crc_ssot -tAc "SELECT column_name FROM information_schema.columns WHERE table_name='patients' AND column_name='$col'" | grep -q "$col"; then
            echo "  ✅ $col"
        else
            echo "  ❌ $col - MISSING"
            MISSING_COLUMNS+=("$col")
        fi
    done
    
    if [ ${#MISSING_COLUMNS[@]} -gt 0 ]; then
        echo ""
        echo "⚠️  Some columns are missing. Please update schema manually or apply full schema."
    fi
    
elif [ "$SCHEMA_TYPE" = "EMPTY" ] || [ "$SCHEMA_TYPE" = "NORMALIZED" ]; then
    echo "⚠️  Database needs JSONB schema"
    echo ""
    echo "Would you like to apply the JSONB schema? (y/n)"
    read -r APPLY_SCHEMA
    
    if [ "$APPLY_SCHEMA" = "y" ] || [ "$APPLY_SCHEMA" = "Y" ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════════════"
        echo "APPLYING JSONB SCHEMA"
        echo "════════════════════════════════════════════════════════════════════════"
        echo ""
        
        # Download schema from Mac (you'll need to copy it first)
        # OR we can embed it in this script
        
        echo "To apply schema, you need to:"
        echo "1. Copy local_schema.sql to this server"
        echo "2. Run: sudo -u postgres psql -d emr_crc_ssot -f /path/to/local_schema.sql"
        echo ""
        echo "OR use this embedded schema:"
        echo ""
        
        # Create schema file
        cat > /tmp/emr_jsonb_schema.sql << 'SCHEMA_EOF'
-- EMR JSONB Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS patients (
  patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  mrn TEXT UNIQUE,
  asam_level TEXT,
  level_of_care TEXT,
  commitment_status TEXT,
  admission_status TEXT,
  medical_acuity TEXT,
  mat_needs JSONB DEFAULT '{}'::jsonb,
  insurance_primary TEXT,
  insurance_secondary TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  searches JSONB DEFAULT '[]'::jsonb,
  search_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facilities (
  facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  phone TEXT,
  facility_type TEXT,
  accepts_302 BOOLEAN DEFAULT false,
  accepts_mat BOOLEAN DEFAULT false,
  accepts_secure BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_searches_gin ON patients USING GIN (searches);
CREATE INDEX IF NOT EXISTS idx_patients_search_history_gin ON patients USING GIN (search_history);
CREATE INDEX IF NOT EXISTS idx_patients_mat_needs_gin ON patients USING GIN (mat_needs);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients (mrn);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities (facility_type);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at 
  BEFORE UPDATE ON facilities 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- HIPAA Audit Logging
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  user_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_created ON audit_log (table_name, created_at DESC);
SCHEMA_EOF

        echo "Applying schema from /tmp/emr_jsonb_schema.sql..."
        sudo -u postgres psql -d emr_crc_ssot -f /tmp/emr_jsonb_schema.sql
        
        echo "✅ Schema applied successfully"
        
        # Grant permissions again
        sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO emr_admin;"
        sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO emr_admin;"
        
        echo "✅ Permissions granted"
    else
        echo "Schema update skipped"
    fi
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 6: Test connection from remote (Mac)
# ───────────────────────────────────────────────────────────────────────────

echo "Step 6: Connection test information"
echo ""
echo "To test from your Mac, run:"
echo ""
echo "  PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c \"SELECT 1;\""
echo ""
echo "Expected output:"
echo "  ?column?"
echo "  ----------"
echo "         1"
echo "  (1 row)"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 7: Summary
# ───────────────────────────────────────────────────────────────────────────

echo "════════════════════════════════════════════════════════════════════════"
echo "SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  • pg_hba.conf: Configured for Tailscale network"
echo "  • PostgreSQL: Running"
echo "  • Database: emr_crc_ssot exists"
echo "  • User: emr_admin exists with permissions"
echo "  • Schema: $SCHEMA_TYPE"
echo ""
echo "Next steps:"
echo "  1. Exit SSH: exit"
echo "  2. Test connection from Mac (command above)"
echo "  3. Restart API server: cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22 && npm run api"
echo "  4. Verify UI shows patient data with bed searches"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
