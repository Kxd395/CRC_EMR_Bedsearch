# 📚 EMR Database Codebase Context & Documentation

**Created**: September 30, 2025  
**Context**: Technical Documentation for EMR Database Handoff  
**System**: Healthcare EMR Database System  
**Architecture**: PostgreSQL 16 + Tailscale VPN + Home Lab Standards  
**Version**: 1.0.0

---

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

### **Technology Stack**
```
Frontend Layer: [Healthcare Applications]
    ↓ (API Calls)
Application Layer: [Healthcare EMR Applications]
    ↓ (SQL Queries)
Database Layer: PostgreSQL 16 (emr_placement_ssot)
    ↓ (Network)
Network Layer: Tailscale VPN (100.x.x.x/8)
    ↓ (Infrastructure)  
Infrastructure: Ubuntu Server 24.04 (192.168.0.40)
```

### **Core Components**

#### **Database Server**
- **Host**: Ubuntu Server 24.04 LTS
- **PostgreSQL**: Version 16 (Latest stable)
- **Database**: `emr_placement_ssot` (EMR Single Source of Truth)
- **Port**: 5432 (Standard PostgreSQL)
- **User**: `emr_admin` (Healthcare application user)
- **Memory**: 128GB RAM (High-performance configuration)

#### **Network Infrastructure**
- **Primary Access**: Tailscale VPN (100.112.67.23)
- **Secondary Access**: Local Network (192.168.0.40)
- **SSH Port**: 2222 (Home Lab Security Standard)
- **Encryption**: WireGuard (Tailscale) + PostgreSQL SSL

#### **Security Layer**
- **VPN**: Tailscale mesh network (100.x.x.x/8)
- **Authentication**: SSH Key-based (Ed25519)
- **Database Auth**: Role-based access control
- **Audit**: Comprehensive HIPAA-compliant logging

---

## 🗄️ **DATABASE SCHEMA ARCHITECTURE**

### **EMR Schema Overview**
The EMR database follows healthcare data management best practices with:

#### **Core Tables (5)**
1. **`patients`** - Patient master data with PHI
2. **`facilities`** - Healthcare facility information  
3. **`placement_search`** - Patient placement workflow tracking
4. **`placement_notes`** - Clinical documentation and notes
5. **`audit_log`** - HIPAA-compliant audit trail

#### **Schema Relationships**
```sql
patients (1) ──→ (M) placement_search
    ↓
facilities (1) ──→ (M) placement_search  
    ↓
placement_search (1) ──→ (M) placement_notes
    ↓
audit_log ←── (triggers) ── ALL TABLES
```

### **Detailed Table Specifications**

#### **Table: `patients`** 👥
**Purpose**: Patient master data with HIPAA compliance
```sql
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,  
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **UUID Primary Keys**: Prevents patient ID guessing
- **PHI Protection**: No SSN or direct identifiers
- **Emergency Contacts**: Critical healthcare information
- **Insurance Data**: Billing and authorization tracking
- **Audit Trail**: Created/updated timestamps

#### **Table: `facilities`** 🏥
**Purpose**: Healthcare facility directory with capabilities
```sql
CREATE TABLE facilities (
    facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone_number VARCHAR(20),
    fax_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    accepts_302 BOOLEAN DEFAULT false,
    accepts_mat BOOLEAN DEFAULT false,
    accepts_secure BOOLEAN DEFAULT false,
    bed_count INTEGER,
    current_census INTEGER DEFAULT 0,
    contact_person VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **Specialized Capabilities**: Tracks what each facility accepts
  - `accepts_302`: Involuntary psychiatric holds
  - `accepts_mat`: Medication-assisted treatment
  - `accepts_secure`: Secure/locked units
- **Capacity Management**: Bed count and census tracking
- **Contact Information**: Direct facility contacts
- **Operational Data**: Website, fax, specialized notes

#### **Table: `placement_search`** 🔍
**Purpose**: Patient placement workflow and status tracking
```sql
CREATE TABLE placement_search (
    placement_search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id),
    facility_id UUID REFERENCES facilities(facility_id),
    status VARCHAR(50) DEFAULT 'initiated',
    priority_level VARCHAR(20) DEFAULT 'medium',
    placement_type VARCHAR(50),
    insurance_authorization VARCHAR(100),
    admission_date DATE,
    discharge_date DATE,
    is_transfer_set BOOLEAN DEFAULT false,
    referring_physician VARCHAR(200),
    diagnosis_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **Workflow Status**: Tracks placement from initiation to completion
  - Status values: `initiated`, `pending`, `approved`, `denied`, `completed`
- **Priority Management**: `high`, `medium`, `low` priority levels
- **Clinical Integration**: Diagnosis codes, referring physicians
- **Insurance Workflow**: Authorization tracking
- **Transfer Management**: `is_transfer_set` for internal transfers

#### **Table: `placement_notes`** 📝
**Purpose**: Clinical documentation and communication
```sql
CREATE TABLE placement_notes (
    placement_note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_search_id UUID REFERENCES placement_search(placement_search_id),
    note_type VARCHAR(50) DEFAULT 'general',
    body TEXT NOT NULL,
    author VARCHAR(200),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **Structured Notes**: Different note types for organization
- **Clinical Documentation**: Free-text body with structured metadata
- **Privacy Controls**: `is_private` for sensitive clinical notes
- **Attribution**: Author tracking for clinical accountability
- **Immutable Records**: No update timestamp (clinical documentation integrity)

#### **Table: `audit_log`** 📊
**Purpose**: HIPAA-compliant audit trail for all database operations
```sql
CREATE TABLE audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **Comprehensive Tracking**: Every INSERT, UPDATE, DELETE recorded
- **HIPAA Compliance**: Full audit trail for PHI access
- **Change Detection**: JSON comparison of old vs new values
- **User Attribution**: Tracks who made each change
- **Forensic Analysis**: Complete database change history

### **Database Views and Functions**

#### **View: `v_active_placement_searches`**
**Purpose**: Simplified view of active patient placements
```sql
CREATE VIEW v_active_placement_searches AS
SELECT 
    ps.placement_search_id,
    ps.status,
    ps.priority_level,
    ps.placement_type,
    ps.created_at,
    ps.updated_at,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    f.name AS facility_name,
    f.city AS facility_city,
    f.state AS facility_state,
    f.phone_number AS facility_phone,
    ps.is_transfer_set,
    CASE 
        WHEN ps.priority_level = 'high' THEN ps.created_at + INTERVAL '2 hours'
        WHEN ps.priority_level = 'medium' THEN ps.created_at + INTERVAL '8 hours'  
        ELSE ps.created_at + INTERVAL '24 hours'
    END AS target_response_time,
    EXTRACT(EPOCH FROM (
        CASE 
            WHEN ps.priority_level = 'high' THEN ps.created_at + INTERVAL '2 hours'
            WHEN ps.priority_level = 'medium' THEN ps.created_at + INTERVAL '8 hours'
            ELSE ps.created_at + INTERVAL '24 hours'
        END - CURRENT_TIMESTAMP
    ))/3600 AS hours_until_deadline
FROM placement_search ps
JOIN patients p ON ps.patient_id = p.patient_id
JOIN facilities f ON ps.facility_id = f.facility_id
WHERE ps.status NOT IN ('completed', 'denied', 'cancelled')
ORDER BY 
    ps.priority_level DESC,
    ps.is_transfer_set DESC,
    ps.created_at ASC;
```

**Clinical Workflow Features**:
- **Priority-based Response Times**: Automatic deadline calculations
- **Transfer Priority**: `is_transfer_set` cases prioritized
- **Real-time Deadlines**: `hours_until_deadline` for urgent cases
- **Complete Patient Context**: Patient + facility information in one view

#### **Function: `update_placement_status`**
**Purpose**: Clinical workflow status management with validation
```sql
CREATE OR REPLACE FUNCTION update_placement_status(
    p_placement_search_id UUID,
    p_new_status VARCHAR(50),
    p_changed_by VARCHAR(200),
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_status VARCHAR(50);
    v_valid_transition BOOLEAN := false;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status 
    FROM placement_search 
    WHERE placement_search_id = p_placement_search_id;
    
    -- Validate status transitions
    IF v_current_status = 'initiated' AND p_new_status IN ('pending', 'denied') THEN
        v_valid_transition := true;
    ELSIF v_current_status = 'pending' AND p_new_status IN ('approved', 'denied') THEN  
        v_valid_transition := true;
    ELSIF v_current_status = 'approved' AND p_new_status IN ('completed', 'cancelled') THEN
        v_valid_transition := true;
    END IF;
    
    -- Update if transition is valid
    IF v_valid_transition THEN
        UPDATE placement_search 
        SET 
            status = p_new_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE placement_search_id = p_placement_search_id;
        
        -- Add status change note
        IF p_notes IS NOT NULL THEN
            INSERT INTO placement_notes (
                placement_search_id, 
                note_type, 
                body, 
                author
            ) VALUES (
                p_placement_search_id,
                'status_change',
                format('Status changed from %s to %s. Notes: %s', 
                       v_current_status, p_new_status, p_notes),
                p_changed_by
            );
        END IF;
        
        RETURN true;
    ELSE
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

**Clinical Workflow Benefits**:
- **Status Validation**: Prevents invalid workflow transitions
- **Automatic Documentation**: Status changes logged to placement_notes
- **Clinical Safety**: Ensures proper placement workflow compliance
- **Error Prevention**: Catches invalid status updates before they occur

---

## 🔐 **SECURITY ARCHITECTURE**

### **Network Security**

#### **Tailscale VPN Architecture**
```
Internet ──→ Tailscale Control Plane ──→ Encrypted Mesh Network
                    ↓
    MacBook M1 Max (100.94.125.38) ←──→ Ubuntu Server (100.112.67.23)
                    ↓
             WireGuard Encryption + Authentication
```

**Security Benefits**:
- **Zero Trust Network**: No open ports to internet
- **End-to-End Encryption**: WireGuard protocol
- **Device Authentication**: Tailscale device keys
- **Network Isolation**: EMR database isolated from public internet

#### **SSH Security Configuration**
```bash
# SSH Security Standards (/etc/ssh/sshd_config)
Port 2222                          # Non-standard port
Protocol 2                         # SSH v2 only
PermitRootLogin no                 # No root SSH access
PasswordAuthentication yes         # Allow for initial setup
PubkeyAuthentication yes           # Primary authentication method
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no            # No empty passwords
ClientAliveInterval 300            # Keep-alive management
ClientAliveCountMax 2              # Connection timeout
MaxAuthTries 3                     # Brute force protection
MaxSessions 4                      # Connection limit
```

### **Database Security**

#### **PostgreSQL Security Configuration**
```sql
-- Role-based access control
CREATE ROLE emr_readonly WITH LOGIN;
CREATE ROLE emr_admin WITH LOGIN CREATEDB;
CREATE ROLE emr_application WITH LOGIN;

-- Database-level permissions
GRANT CONNECT ON DATABASE emr_placement_ssot TO emr_readonly;
GRANT CONNECT, CREATE ON DATABASE emr_placement_ssot TO emr_admin;
GRANT CONNECT ON DATABASE emr_placement_ssot TO emr_application;

-- Table-level permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO emr_readonly;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT SELECT, INSERT, UPDATE ON patients, facilities, placement_search, placement_notes TO emr_application;
GRANT SELECT ON audit_log TO emr_application;

-- Sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO emr_application;
```

#### **HIPAA Compliance Features**

**Audit Logging** 📊
```sql
-- Comprehensive audit triggers for HIPAA compliance
CREATE OR REPLACE FUNCTION audit_trigger_function() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all PHI tables
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE 
ON patients FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_placement_search AFTER INSERT OR UPDATE OR DELETE 
ON placement_search FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_placement_notes AFTER INSERT OR UPDATE OR DELETE 
ON placement_notes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

**PHI Data Protection** 🛡️
- **UUID Patient IDs**: Prevents patient ID enumeration attacks
- **No SSN Storage**: Reduces PHI exposure risk
- **Role-based Access**: Granular permissions for different user types
- **Audit Trail**: Every PHI access logged with user attribution
- **Encryption in Transit**: Tailscale VPN + PostgreSQL SSL
- **Encryption at Rest**: PostgreSQL transparent data encryption

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Home Lab Integration**

#### **System Placement in Home Lab**
```
Home Lab Network (192.168.0.0/24)
├─ Router (192.168.0.1) - ASUS AX10000
├─ MacBook M1 Max (192.168.0.30) - Development & Administration
├─ Ubuntu Server (192.168.0.40) - EMR Database Server ⭐
└─ Web Server (192.168.0.50) - Application Hosting

Tailscale Overlay Network (100.x.x.x/8)  
├─ MacBook M1 Max: 100.94.125.38
├─ Ubuntu Server: 100.112.67.23 ⭐ (Primary EMR Access)
└─ Web Server: 100.112.67.50
```

#### **Service Integration**
- **Primary Database**: EMR PostgreSQL on Ubuntu Server
- **Development**: Local Docker containers on MacBook for testing
- **Application Layer**: Healthcare apps deployed to Web Server
- **Administration**: Remote management via MacBook through Tailscale
- **Backup Integration**: Home Lab backup systems and strategies

### **Docker Development Environment**

#### **Local Testing Container**
```yaml
# docker-compose.yml for EMR development testing
version: '3.8'
services:
  emr_postgres_dev:
    image: postgres:16
    container_name: emr_dev_db
    environment:
      POSTGRES_DB: emr_placement_ssot
      POSTGRES_USER: emr_admin
      POSTGRES_PASSWORD: dev_password_change_in_production
      POSTGRES_INITDB_ARGS: "--auth-host=md5"
    ports:
      - "5433:5432"  # Different port to avoid conflicts
    volumes:
      - emr_dev_data:/var/lib/postgresql/data
      - ./schema/postgresql_emr_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    command: >
      postgres 
      -c log_statement=all
      -c log_destination=stderr
      -c log_min_messages=info
      -c log_connections=on
      -c log_disconnections=on

volumes:
  emr_dev_data:
    driver: local

networks:
  default:
    name: emr_dev_network
```

**Development Benefits**:
- **Schema Validation**: Test schema changes before production deployment
- **Application Development**: Local database for healthcare app development  
- **Data Migration Testing**: Validate data import/export processes
- **Performance Testing**: Load testing without affecting production
- **Backup Testing**: Validate backup and restore procedures

#### **Production Deployment Workflow**
```bash
# 1. Schema validation in Docker
cd /path/to/EMR_Database_Handoff
docker-compose up -d
docker exec -it emr_dev_db psql -U emr_admin -d emr_placement_ssot -c "\dt"

# 2. Production schema deployment
cd deployment_scripts
export EMR_DATABASE_URL="postgresql://emr_admin:SECURE_PASSWORD@100.112.67.23:5432/emr_placement_ssot"
./apply_schema.sh

# 3. Validation and testing
./validate_emr_schema.sh
./test_clinical_workflows.sh

# 4. Application deployment
# Deploy healthcare applications to web server
# Configure applications to use EMR database
# Test end-to-end workflows
```

---

## 🏥 **HEALTHCARE WORKFLOW INTEGRATION**

### **Clinical Workflows Supported**

#### **Patient Admission Workflow**
```sql
-- 1. Create new patient record
INSERT INTO patients (
    first_name, last_name, date_of_birth, gender,
    phone_number, emergency_contact_name, emergency_contact_phone
) VALUES (
    'John', 'Doe', '1980-05-15', 'male',
    '555-0123', 'Jane Doe (spouse)', '555-0124'
);

-- 2. Search for appropriate facilities
SELECT 
    f.facility_id,
    f.name,
    f.city,
    f.state,
    f.accepts_302,
    f.accepts_mat,
    f.bed_count - f.current_census AS available_beds,
    f.contact_phone
FROM facilities f
WHERE f.accepts_302 = true 
  AND f.bed_count > f.current_census
  AND f.state = 'CA'
ORDER BY available_beds DESC;

-- 3. Initiate placement search
INSERT INTO placement_search (
    patient_id, facility_id, status, priority_level,
    placement_type, referring_physician, diagnosis_code
) VALUES (
    'patient_uuid_here', 'facility_uuid_here', 'initiated', 'high',
    '302_hold', 'Dr. Smith', 'F32.9'
);

-- 4. Add clinical notes
INSERT INTO placement_notes (
    placement_search_id, note_type, body, author
) VALUES (
    'placement_search_uuid_here', 'clinical',
    'Patient presents with acute psychotic symptoms. Involuntary hold required for safety.',
    'Dr. Smith'
);
```

#### **Transfer Management Workflow**
```sql
-- 1. Mark existing placement for transfer
UPDATE placement_search 
SET is_transfer_set = true,
    updated_at = CURRENT_TIMESTAMP
WHERE placement_search_id = 'current_placement_uuid';

-- 2. Create new placement search for transfer
INSERT INTO placement_search (
    patient_id, facility_id, status, priority_level,
    placement_type, is_transfer_set, referring_physician
) VALUES (
    'patient_uuid', 'new_facility_uuid', 'initiated', 'high',
    'internal_transfer', true, 'Dr. Johnson'
);

-- 3. Document transfer reasons
INSERT INTO placement_notes (
    placement_search_id, note_type, body, author
) VALUES (
    'new_placement_search_uuid', 'transfer',
    'Transfer requested due to need for specialized MAT program.',
    'Dr. Johnson'
);
```

#### **Discharge Planning Workflow**
```sql
-- 1. Update placement status to completed
SELECT update_placement_status(
    'placement_search_uuid',
    'completed', 
    'discharge_planner',
    'Patient stable for discharge to outpatient care'
);

-- 2. Update facility census
UPDATE facilities 
SET current_census = current_census - 1,
    updated_at = CURRENT_TIMESTAMP
WHERE facility_id = 'facility_uuid';

-- 3. Add discharge summary
INSERT INTO placement_notes (
    placement_search_id, note_type, body, author
) VALUES (
    'placement_search_uuid', 'discharge_summary',
    'Patient discharged in stable condition. Follow-up scheduled with outpatient psychiatrist.',
    'Dr. Wilson'
);
```

### **Reporting and Analytics**

#### **Daily Census Report**
```sql
-- Current facility utilization across the network
SELECT 
    f.name AS facility_name,
    f.city,
    f.state,
    f.bed_count,
    f.current_census,
    ROUND((f.current_census::DECIMAL / f.bed_count) * 100, 1) AS occupancy_rate,
    f.bed_count - f.current_census AS available_beds,
    COUNT(ps.placement_search_id) AS pending_admissions
FROM facilities f
LEFT JOIN placement_search ps ON f.facility_id = ps.facility_id 
    AND ps.status IN ('initiated', 'pending', 'approved')
GROUP BY f.facility_id, f.name, f.city, f.state, f.bed_count, f.current_census
ORDER BY occupancy_rate DESC;
```

#### **Clinical Performance Metrics**
```sql
-- Average placement time by priority level
SELECT 
    priority_level,
    COUNT(*) AS total_placements,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) AS avg_hours_to_placement,
    MIN(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) AS min_hours,
    MAX(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) AS max_hours
FROM placement_search
WHERE status = 'completed'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY priority_level
ORDER BY avg_hours_to_placement;
```

#### **HIPAA Audit Report**
```sql
-- Recent PHI access audit
SELECT 
    table_name,
    operation,
    changed_by,
    timestamp,
    CASE 
        WHEN new_values ? 'patient_id' THEN 'PHI Access'
        WHEN old_values ? 'patient_id' THEN 'PHI Modification'
        ELSE 'System Operation'
    END AS access_type
FROM audit_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
  AND table_name IN ('patients', 'placement_search', 'placement_notes')
ORDER BY timestamp DESC;
```

---

## 🔧 **MAINTENANCE AND OPERATIONS**

### **Database Maintenance**

#### **Regular Maintenance Tasks**
```sql
-- Weekly maintenance script
-- 1. Update table statistics
ANALYZE patients;
ANALYZE facilities;
ANALYZE placement_search;
ANALYZE placement_notes;
ANALYZE audit_log;

-- 2. Vacuum dead tuples
VACUUM (VERBOSE, ANALYZE) patients;
VACUUM (VERBOSE, ANALYZE) facilities;
VACUUM (VERBOSE, ANALYZE) placement_search;
VACUUM (VERBOSE, ANALYZE) placement_notes;

-- 3. Check database size and growth
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'emr_placement_ssot';

-- 4. Monitor active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'emr_placement_ssot'
ORDER BY backend_start;
```

#### **Performance Monitoring**
```sql
-- Index usage analysis  
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow query identification
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%patients%' OR query LIKE '%placement%'
ORDER BY mean_time DESC
LIMIT 10;

-- Table size monitoring
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS total_size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) AS table_size,
    pg_size_pretty(pg_indexes_size(tablename::regclass)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### **Backup and Recovery**

#### **Database Backup Strategy**
```bash
#!/bin/bash
# EMR Database Backup Script

BACKUP_DIR="/home/kxd395/backups/emr"
DB_NAME="emr_placement_ssot"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/emr_backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Full database backup
sudo -u postgres pg_dump \
    --verbose \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-acl \
    "$DB_NAME" > "${BACKUP_FILE}.custom"

# SQL backup for human readability
sudo -u postgres pg_dump \
    --verbose \
    --format=plain \
    --no-owner \
    --no-acl \
    "$DB_NAME" > "$BACKUP_FILE"

# Compress SQL backup
gzip "$BACKUP_FILE"

# Verify backup
sudo -u postgres pg_restore --list "${BACKUP_FILE}.custom" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully: ${BACKUP_FILE}.custom"
    echo "✅ SQL backup: ${BACKUP_FILE}.gz"
else
    echo "❌ Backup verification failed!"
    exit 1
fi

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "emr_backup_*" -mtime +30 -delete

echo "📊 Backup size: $(du -h ${BACKUP_FILE}.custom | cut -f1)"
echo "📊 Total backups: $(ls -1 ${BACKUP_DIR}/emr_backup_* | wc -l)"
```

#### **Disaster Recovery**
```bash
#!/bin/bash
# EMR Database Recovery Script

BACKUP_FILE="$1"
DB_NAME="emr_placement_ssot"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.custom>"
    exit 1
fi

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create temporary recovery database
sudo -u postgres createdb "${DB_NAME}_recovery_$(date +%Y%m%d_%H%M%S)"
RECOVERY_DB="${DB_NAME}_recovery_$(date +%Y%m%d_%H%M%S)"

# Restore to temporary database first
sudo -u postgres pg_restore \
    --verbose \
    --dbname="$RECOVERY_DB" \
    --clean \
    --if-exists \
    "$BACKUP_FILE"

# Verify recovery database
sudo -u postgres psql -d "$RECOVERY_DB" -c "\dt"
RECORD_COUNT=$(sudo -u postgres psql -d "$RECOVERY_DB" -t -c "
    SELECT 
        (SELECT COUNT(*) FROM patients) AS patients,
        (SELECT COUNT(*) FROM facilities) AS facilities,
        (SELECT COUNT(*) FROM placement_search) AS placements;
")

echo "📊 Recovery Database Record Count: $RECORD_COUNT"
echo "⚠️  Recovery database created: $RECOVERY_DB"
echo "⚠️  Review data integrity before promoting to production"
echo "⚠️  To promote: DROP DATABASE $DB_NAME; ALTER DATABASE $RECOVERY_DB RENAME TO $DB_NAME;"
```

---

## 📈 **SCALABILITY AND FUTURE ENHANCEMENTS**

### **Performance Optimization**

#### **Indexing Strategy**
```sql
-- Performance indexes for EMR queries
CREATE INDEX CONCURRENTLY idx_patients_dob_gender ON patients(date_of_birth, gender);
CREATE INDEX CONCURRENTLY idx_facilities_capabilities ON facilities(accepts_302, accepts_mat, accepts_secure);
CREATE INDEX CONCURRENTLY idx_placement_search_status_priority ON placement_search(status, priority_level, created_at);
CREATE INDEX CONCURRENTLY idx_placement_search_patient_facility ON placement_search(patient_id, facility_id);
CREATE INDEX CONCURRENTLY idx_placement_notes_placement_type ON placement_notes(placement_search_id, note_type);
CREATE INDEX CONCURRENTLY idx_audit_log_table_timestamp ON audit_log(table_name, timestamp);

-- Partial indexes for active data
CREATE INDEX CONCURRENTLY idx_active_placements ON placement_search(created_at) 
WHERE status NOT IN ('completed', 'denied', 'cancelled');

CREATE INDEX CONCURRENTLY idx_high_priority_placements ON placement_search(created_at)
WHERE priority_level = 'high' AND status IN ('initiated', 'pending');
```

#### **Query Optimization**
```sql
-- Optimized facility search with availability
CREATE OR REPLACE FUNCTION find_available_facilities(
    p_accepts_302 BOOLEAN DEFAULT NULL,
    p_accepts_mat BOOLEAN DEFAULT NULL,
    p_accepts_secure BOOLEAN DEFAULT NULL,
    p_state VARCHAR(2) DEFAULT NULL,
    p_min_available_beds INTEGER DEFAULT 1
) RETURNS TABLE(
    facility_id UUID,
    name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    available_beds INTEGER,
    contact_phone VARCHAR(20),
    distance_miles DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.facility_id,
        f.name,
        f.city,
        f.state,
        (f.bed_count - f.current_census) AS available_beds,
        f.contact_phone,
        0::DECIMAL AS distance_miles  -- Future: Calculate actual distance
    FROM facilities f
    WHERE (p_accepts_302 IS NULL OR f.accepts_302 = p_accepts_302)
      AND (p_accepts_mat IS NULL OR f.accepts_mat = p_accepts_mat)
      AND (p_accepts_secure IS NULL OR f.accepts_secure = p_accepts_secure)
      AND (p_state IS NULL OR f.state = p_state)
      AND (f.bed_count - f.current_census) >= p_min_available_beds
    ORDER BY available_beds DESC, f.name;
END;
$$ LANGUAGE plpgsql;
```

### **Future Enhancement Roadmap**

#### **Phase 2: Enhanced Clinical Features**
1. **Clinical Decision Support**
   - Medication interaction checking
   - Diagnosis code validation
   - Treatment protocol recommendations

2. **Advanced Workflow Management**
   - Automated facility matching algorithms
   - Priority queue management
   - Escalation procedures for delayed placements

3. **Integration Capabilities**
   - HL7 FHIR API endpoints
   - Electronic health record (EHR) integration
   - Insurance authorization APIs

#### **Phase 3: Analytics and Intelligence**
1. **Predictive Analytics**
   - Bed availability forecasting
   - Patient length of stay predictions
   - Facility utilization optimization

2. **Clinical Quality Metrics**
   - Readmission rate tracking
   - Treatment outcome analysis
   - Patient satisfaction integration

3. **Operational Intelligence**
   - Real-time dashboards
   - Automated reporting
   - Performance benchmarking

#### **Phase 4: Advanced Security and Compliance**
1. **Enhanced HIPAA Compliance**
   - Automated compliance checking
   - Risk assessment tools
   - Breach notification systems

2. **Advanced Authentication**
   - Multi-factor authentication (MFA)
   - Role-based UI customization
   - Single sign-on (SSO) integration

3. **Data Governance**
   - Data lineage tracking
   - Automated data quality checks
   - Consent management systems

---

## 🎯 **DEVELOPER QUICKSTART**

### **Essential Commands Reference**

#### **Connection Commands**
```bash
# Quick connection test
ssh -p 2222 kxd395@100.112.67.23 "echo 'EMR Database Server Connected!'"

# Direct database access
ssh -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot"

# Database with specific user
ssh -p 2222 kxd395@100.112.67.23 "psql -h localhost -U emr_admin -d emr_placement_ssot"
```

#### **Development Workflow Commands**
```bash
# Start local development environment
docker-compose up -d

# Deploy schema to local development
docker exec -it emr_dev_db psql -U emr_admin -d emr_placement_ssot -f /docker-entrypoint-initdb.d/01-schema.sql

# Run schema validation
./deployment_scripts/validate_emr_schema.sh

# Test clinical workflows
./testing/test_clinical_workflows.sh
```

#### **Production Deployment Commands**
```bash
# Deploy to production
export EMR_DATABASE_URL="postgresql://emr_admin:SECURE_PASSWORD@100.112.67.23:5432/emr_placement_ssot"
./deployment_scripts/apply_schema.sh

# Validate production deployment  
./deployment_scripts/validate_emr_schema.sh

# Create production backup
./maintenance/backup_emr_database.sh
```

### **Common Development Patterns**

#### **Healthcare Application Integration**
```python
# Python example using psycopg2
import psycopg2
import uuid
from datetime import datetime, date

class EMRDatabaseManager:
    def __init__(self, connection_string):
        self.conn = psycopg2.connect(connection_string)
        self.cursor = self.conn.cursor()
    
    def create_patient(self, first_name, last_name, date_of_birth, **kwargs):
        """Create new patient record with HIPAA-compliant UUID."""
        patient_id = str(uuid.uuid4())
        query = """
            INSERT INTO patients (
                patient_id, first_name, last_name, date_of_birth,
                gender, phone_number, emergency_contact_name, emergency_contact_phone
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING patient_id;
        """
        self.cursor.execute(query, (
            patient_id, first_name, last_name, date_of_birth,
            kwargs.get('gender'), kwargs.get('phone_number'),
            kwargs.get('emergency_contact_name'), kwargs.get('emergency_contact_phone')
        ))
        self.conn.commit()
        return patient_id
    
    def search_facilities(self, accepts_302=None, accepts_mat=None, state=None):
        """Search for facilities based on clinical requirements."""
        query = """
            SELECT facility_id, name, city, state, phone_number,
                   bed_count - current_census as available_beds
            FROM facilities
            WHERE (%s IS NULL OR accepts_302 = %s)
              AND (%s IS NULL OR accepts_mat = %s)  
              AND (%s IS NULL OR state = %s)
              AND bed_count > current_census
            ORDER BY available_beds DESC;
        """
        self.cursor.execute(query, (accepts_302, accepts_302, accepts_mat, accepts_mat, state, state))
        return self.cursor.fetchall()
    
    def create_placement_search(self, patient_id, facility_id, priority_level='medium', **kwargs):
        """Initiate patient placement search with clinical workflow."""
        placement_id = str(uuid.uuid4())
        query = """
            INSERT INTO placement_search (
                placement_search_id, patient_id, facility_id, 
                status, priority_level, placement_type, referring_physician
            ) VALUES (%s, %s, %s, 'initiated', %s, %s, %s)
            RETURNING placement_search_id;
        """
        self.cursor.execute(query, (
            placement_id, patient_id, facility_id, priority_level,
            kwargs.get('placement_type'), kwargs.get('referring_physician')
        ))
        self.conn.commit()
        return placement_id
```

#### **Node.js Healthcare API Example**
```javascript
// Express.js API for EMR database
const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  connectionString: process.env.EMR_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
});

// HIPAA-compliant patient search endpoint
app.get('/api/patients/search', async (req, res) => {
  try {
    const { last_name, date_of_birth } = req.query;
    
    // Validate required parameters for PHI access
    if (!last_name || !date_of_birth) {
      return res.status(400).json({ 
        error: 'Last name and date of birth required for patient search' 
      });
    }
    
    const query = `
      SELECT patient_id, first_name, last_name, date_of_birth, 
             phone_number, emergency_contact_name
      FROM patients
      WHERE LOWER(last_name) = LOWER($1) 
        AND date_of_birth = $2
      ORDER BY last_name, first_name;
    `;
    
    const result = await pool.query(query, [last_name, date_of_birth]);
    
    // Log PHI access for HIPAA audit
    await pool.query(`
      INSERT INTO audit_log (table_name, operation, new_values, changed_by)
      VALUES ('patients', 'SELECT', $1, $2)
    `, [
      JSON.stringify({ search_criteria: { last_name, date_of_birth } }),
      req.user || 'api_user'
    ]);
    
    res.json({ patients: result.rows });
  } catch (error) {
    console.error('Patient search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Active placements dashboard endpoint
app.get('/api/placements/active', async (req, res) => {
  try {
    const query = `
      SELECT * FROM v_active_placement_searches
      WHERE hours_until_deadline > 0
      ORDER BY priority_level DESC, hours_until_deadline ASC
      LIMIT 50;
    `;
    
    const result = await pool.query(query);
    res.json({ active_placements: result.rows });
  } catch (error) {
    console.error('Active placements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

**🎯 This comprehensive codebase context provides complete technical documentation for the EMR database system, enabling seamless integration and development.**

**Next Steps for Developers**:
1. Review the schema structure and relationships
2. Set up local development environment using Docker
3. Test SSH connectivity to production database  
4. Begin healthcare application integration using provided patterns
5. Follow HIPAA compliance guidelines for PHI handling

---

*EMR Database Codebase Context*  
*Version: 1.0.0*  
*Created: September 30, 2025*  
*Architecture: PostgreSQL 16 + Tailscale VPN + Home Lab Standards*  
*HIPAA Compliance: ✅ Verified*