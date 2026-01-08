# 🚀 EXECUTE NOW - Database Schema Update

**Status**: ✅ **READY TO RUN**  
**SSH Port Discovered**: 2222 (not standard port 22)  
**Server Reachable**: ✅ Ping successful  
**Estimated Time**: 10 minutes

---

## 📋 **WHAT WE DISCOVERED**

1. ✅ **Server is online**: 100.112.67.23 responds to ping
2. ✅ **SSH port found**: Port **2222** (not 22!)
3. ✅ **Network connection**: Tailscale working
4. ⚠️ **SSH requires password**: Interactive login needed

---

## 🚀 **RUN THIS NOW**

### **Step 1: SSH to Server**

```bash
ssh -p 2222 kevindialmb@100.112.67.23
# Enter your password when prompted
```

### **Step 2: Run the Automated Script**

I've created a comprehensive script that will:
1. ✅ Fix pg_hba.conf (if needed)
2. ✅ Verify/create database and user
3. ✅ Check current schema
4. ✅ Apply JSONB schema (if needed)
5. ✅ Grant all permissions

**Copy-paste this entire block:**

```bash
# Download the script from your local machine
# OR copy-paste the script content directly

# Create the script on the server
cat > /tmp/setup_emr_db.sh << 'SCRIPT_END'
#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "EMR Database Setup & Schema Update"
echo "════════════════════════════════════════════════════════════════════════"

# Fix pg_hba.conf
echo "Fixing pg_hba.conf..."
if ! sudo grep -q "100.64.0.0/10" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup
    echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    sudo systemctl restart postgresql
    echo "✅ pg_hba.conf updated"
else
    echo "✅ pg_hba.conf already configured"
fi

# Verify PostgreSQL running
echo "Checking PostgreSQL..."
sudo systemctl start postgresql 2>/dev/null || true
echo "✅ PostgreSQL running"

# Create database if needed
echo "Checking database..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw emr_crc_ssot || sudo -u postgres psql -c "CREATE DATABASE emr_crc_ssot;"
echo "✅ Database exists"

# Create user if needed
echo "Checking user..."
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='emr_admin'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON SCHEMA public TO emr_admin;"
echo "✅ User configured"

# Check schema
echo ""
echo "Current schema:"
sudo -u postgres psql -d emr_crc_ssot -c "\dt" || echo "No tables yet"

# Apply JSONB schema
echo ""
echo "Applying JSONB schema..."
cat > /tmp/schema.sql << 'SQL_END'
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
\$\$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

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
SQL_END

sudo -u postgres psql -d emr_crc_ssot -f /tmp/schema.sql
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO emr_admin;"
sudo -u postgres psql -d emr_crc_ssot -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO emr_admin;"

echo "✅ Schema applied"
echo ""
echo "Final schema:"
sudo -u postgres psql -d emr_crc_ssot -c "\d patients"

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "Test from Mac:"
echo "  PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c \"SELECT 1;\""
SCRIPT_END

# Run it
chmod +x /tmp/setup_emr_db.sh
/tmp/setup_emr_db.sh
```

### **Step 3: Exit SSH**

```bash
exit
```

---

## 🧪 **TEST FROM YOUR MAC**

After exiting SSH, test the connection:

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected output:**
```
 ?column? 
----------
        1
(1 row)
```

---

## ✅ **VERIFY SCHEMA**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "\d patients"
```

**Look for these columns:**
- ✅ first_name, last_name, mrn
- ✅ asam_level, level_of_care, commitment_status
- ✅ **searches (JSONB)** ← Bed searches
- ✅ **search_history (JSONB)** ← History
- ✅ **updated_at** ← Update tracking
- ✅ mat_needs, insurance fields

---

## 🚀 **RESTART API SERVER**

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Stop current server (Ctrl+C if running)

# Start API server
npm run api
```

**Look for in logs:**
```
✅ Database connection successful
✅ Connected to emr_crc_ssot at 100.112.67.23:5432
```

**Should NOT see:**
```
❌ Falling back to local file storage
```

---

## 🎉 **SUCCESS CHECKLIST**

- [ ] SSH'd to server on port 2222
- [ ] Ran setup script (no errors)
- [ ] Test query returned `1`
- [ ] Schema shows `searches` and `search_history` columns
- [ ] API server connects to database (no fallback)
- [ ] UI shows patient names correctly
- [ ] Assessment Overview tab displays bed searches

---

## 📝 **IMPORTANT NOTES**

### **SSH Port**
- ⚠️ SSH is on port **2222** (not standard 22)
- Update any scripts/docs that use port 22
- Update handoff docs with correct port

### **What the Script Does**
1. Backs up pg_hba.conf before changes
2. Adds Tailscale network (100.64.0.0/10) to pg_hba.conf
3. Restarts PostgreSQL to apply config
4. Creates database `emr_crc_ssot` if missing
5. Creates user `emr_admin` with password
6. Applies complete JSONB schema with:
   - patients table with searches JSONB field
   - facilities table
   - audit_log table for HIPAA compliance
   - GIN indexes for fast JSONB queries
   - Auto-update trigger for updated_at
7. Grants all permissions to emr_admin

### **Schema Applied**
- ✅ All patient clinical fields
- ✅ Bed searches stored as JSONB array in patient record
- ✅ Search history tracking
- ✅ Auto-updating timestamps
- ✅ HIPAA audit logging table
- ✅ Performance indexes

---

**Created**: September 30, 2025  
**Status**: ✅ Ready to execute  
**Estimated Time**: 10 minutes
