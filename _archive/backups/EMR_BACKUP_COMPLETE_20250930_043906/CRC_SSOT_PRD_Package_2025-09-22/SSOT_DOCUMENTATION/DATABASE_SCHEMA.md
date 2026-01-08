# 🗄️ EMR CRC SSOT - Database Schema (SSOT)

**Last Updated**: September 29, 2025  
**Database**: PostgreSQL 14+  
**Host**: 100.112.67.23:5432  
**Database Name**: emr_crc_ssot

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:

- ✅ New table created
- ✅ Column added/removed/modified
- ✅ Index added/removed  
- ✅ Constraint added/removed
- ✅ Data type changed
- ✅ Default value changed
- ✅ Trigger created/modified

## 🏗️ Current Schema Status

### 🔧 Known Issues

**CRITICAL**: Missing JSONB columns in remote database

- ❌ `patients.searches` column missing
- ❌ `patients.search_history` column missing  
- ❌ `patients.mat_needs` column missing

**Fix Required**: Run `migrate-database-schema.sh` after IP whitelist update

## 📊 Tables Overview

### patients (Primary Healthcare Data)

**Purpose**: Core patient information and healthcare data

```sql
CREATE TABLE patients (
    -- Core Identity
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    mrn VARCHAR(50) UNIQUE,
    
    -- Healthcare Status  
    admission_status TEXT,
    asam_level VARCHAR(20),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    medical_acuity VARCHAR(20),
    
    -- Insurance Information
    insurance_primary TEXT,
    insurance_secondary TEXT,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Complex Healthcare Data (JSONB)
    searches JSONB DEFAULT '[]'::jsonb,
    search_history JSONB DEFAULT '[]'::jsonb, 
    mat_needs JSONB DEFAULT '{}'::jsonb,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_sync TIMESTAMPTZ DEFAULT now()
);
```

### 🔍 Indexes

```sql
-- Primary Performance Indexes
CREATE INDEX idx_patients_mrn ON patients (mrn);
CREATE INDEX idx_patients_name ON patients (last_name, first_name);
CREATE INDEX idx_patients_admission ON patients (admission_status);
CREATE INDEX idx_patients_asam ON patients (asam_level);

-- JSONB Search Indexes (GIN)
CREATE INDEX idx_patients_searches_gin ON patients USING GIN (searches);
CREATE INDEX idx_patients_search_history_gin ON patients USING GIN (search_history);
CREATE INDEX idx_patients_mat_needs_gin ON patients USING GIN (mat_needs);

-- Audit Indexes
CREATE INDEX idx_patients_updated ON patients (updated_at DESC);
CREATE INDEX idx_patients_sync ON patients (last_sync DESC);
```

## 📋 Column Specifications

### Core Patient Fields

| Column | Type | Constraints | Purpose | Example |
|--------|------|-------------|---------|---------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique patient identifier | `pt_501` |
| `first_name` | VARCHAR(100) | NOT NULL | Patient first name | `Dana` |
| `last_name` | VARCHAR(100) | NOT NULL | Patient last name | `Nguyen` |
| `date_of_birth` | DATE | - | Patient birth date | `1998-03-15` |
| `mrn` | VARCHAR(50) | UNIQUE | Medical record number | `MRN789012` |

### Healthcare Status Fields

| Column | Type | Constraints | Purpose | Values |
|--------|------|-------------|---------|---------|
| `admission_status` | TEXT | - | Current admission status | `Admitted`, `Discharged`, `Pending` |
| `asam_level` | VARCHAR(20) | - | ASAM level of care | `3.5`, `3.7WM`, `4.0`, etc. |
| `level_of_care` | VARCHAR(50) | - | Current LOC | `Residential`, `Outpatient`, `Inpatient` |
| `commitment_status` | VARCHAR(50) | - | Legal commitment | `Voluntary`, `302Hold`, `201Hold` |
| `medical_acuity` | VARCHAR(20) | - | Medical complexity | `Low`, `Medium`, `High`, `Critical` |

### JSONB Complex Data Fields

#### searches (JSONB Array)

**Purpose**: Active placement searches for facilities

**Structure**:

```json
[
  {
    "id": "S501-01",
    "facilityId": "FAC001", 
    "facilityName": "Liberty Mid-Atlantic",
    "status": "Pending",
    "created": "09/29 14:30",
    "updated": "09/29 14:30", 
    "channels": ["fax", "phone"],
    "summary": "New search added from facility directory",
    "assignedTo": "mlee",
    "timeBucket": "today",
    "events": [
      {
        "id": "EVT001",
        "type": "status_change",
        "timestamp": "09/29 14:35",
        "details": "Called facility - left voicemail",
        "userId": "mlee"
      }
    ]
  }
]
```

#### search_history (JSONB Array)

**Purpose**: Timeline of all search activities

**Structure**:

```json
[
  {
    "ts": "09/29 14:30",
    "status": "Pending",
    "facility": "Liberty Mid-Atlantic", 
    "detail": "Search initiated from facility directory"
  },
  {
    "ts": "09/29 14:35", 
    "status": "Called",
    "facility": "Liberty Mid-Atlantic",
    "detail": "Left voicemail with admissions"
  }
]
```

#### mat_needs (JSONB Object)

**Purpose**: Medication Assisted Treatment requirements

**Structure**:

```json
{
  "type": "SuboxoneContinue",
  "dosage": "8mg",
  "frequency": "Daily",
  "provider": "Dr. Smith",
  "lastDose": "2025-09-29T08:00:00Z",
  "notes": "Patient stable on current regimen"
}
```

**Valid MAT Types**:

- `None` - No MAT needed
- `MethadoneInduction` - Starting methadone
- `MethadoneContinue` - Continuing methadone
- `SuboxoneInduction` - Starting Suboxone  
- `SuboxoneContinue` - Continuing Suboxone
- `DetoxOnly` - Detox without maintenance

### Audit Fields

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `created_at` | TIMESTAMPTZ | `now()` | Record creation time |
| `updated_at` | TIMESTAMPTZ | `now()` | Last modification time |
| `last_sync` | TIMESTAMPTZ | `now()` | Last database sync |

## 🔐 Constraints & Rules

### Data Validation Rules

```sql
-- Ensure valid ASAM levels
ALTER TABLE patients ADD CONSTRAINT chk_asam_level 
CHECK (asam_level IN ('2.1', '3.1', '3.3', '3.5', '3.5COC', '3.7WM', '4.0', '4.0WM', 'IP Psych', 'ACUTE201', 'ACUTE302', 'DIAL'));

-- Ensure valid admission status
ALTER TABLE patients ADD CONSTRAINT chk_admission_status
CHECK (admission_status IN ('Admitted', 'Discharged', 'Pending', 'Transferred', 'AMA'));

-- Ensure valid medical acuity
ALTER TABLE patients ADD CONSTRAINT chk_medical_acuity  
CHECK (medical_acuity IN ('Low', 'Medium', 'High', 'Critical'));
```

### JSONB Validation

```sql
-- Ensure searches is always an array
ALTER TABLE patients ADD CONSTRAINT chk_searches_array
CHECK (jsonb_typeof(searches) = 'array');

-- Ensure search_history is always an array  
ALTER TABLE patients ADD CONSTRAINT chk_search_history_array
CHECK (jsonb_typeof(search_history) = 'array');

-- Ensure mat_needs is always an object
ALTER TABLE patients ADD CONSTRAINT chk_mat_needs_object
CHECK (jsonb_typeof(mat_needs) = 'object');
```

## 🚀 Performance Optimization

### Query Patterns

**Most Common Queries**:

```sql
-- Get patient with searches
SELECT id, first_name, last_name, searches 
FROM patients 
WHERE id = 'pt_501';

-- Search patients by name
SELECT id, first_name, last_name, admission_status
FROM patients  
WHERE lower(last_name) LIKE lower('nguyen%')
ORDER BY last_name, first_name;

-- Find patients with pending searches
SELECT id, first_name, last_name, searches
FROM patients
WHERE searches @> '[{"status": "Pending"}]';

-- Get patients by ASAM level  
SELECT id, first_name, last_name, asam_level
FROM patients
WHERE asam_level = '3.5'
ORDER BY updated_at DESC;
```

### Index Usage

- **Name searches**: Use `idx_patients_name`
- **MRN lookups**: Use `idx_patients_mrn`  
- **JSONB searches**: Use GIN indexes
- **Recent updates**: Use `idx_patients_updated`

## 📈 Growth Projections

### Current Statistics

- **Total Patients**: ~27 active
- **Average Searches per Patient**: 2-3
- **Search History Events**: 5-10 per patient
- **Database Size**: < 10MB

### Scaling Considerations

- **1,000 patients**: Add partitioning by admission_date
- **10,000 patients**: Consider read replicas
- **100,000 patients**: Implement archival strategy

## 🛠️ Maintenance Tasks

### Daily Maintenance

```sql
-- Update statistics
ANALYZE patients;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND tablename = 'patients';
```

### Weekly Maintenance

```sql
-- Reindex JSONB columns
REINDEX INDEX idx_patients_searches_gin;
REINDEX INDEX idx_patients_search_history_gin;
REINDEX INDEX idx_patients_mat_needs_gin;
```

### Monthly Maintenance

```sql
-- Vacuum and analyze
VACUUM ANALYZE patients;

-- Check table bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🔄 Migration Scripts

### Required Migration

**File**: `remote_db_migration.sql`

**Purpose**: Add missing JSONB columns to remote database

**Status**: ⚠️ PENDING - Requires IP whitelist update first

### Migration Command

```bash
# After IP whitelisting:
./migrate-database-schema.sh
```

## 🆘 Troubleshooting

### Common Issues

**Issue**: JSONB column missing errors

**Solution**: Run migration script

**Issue**: Slow JSONB queries

**Solution**: Check GIN indexes exist

**Issue**: Connection failures

**Solution**: Verify IP in pg_hba.conf

### Emergency Recovery

```sql
-- Restore from backup
pg_restore -h 100.112.67.23 -U emr_admin -d emr_crc_ssot backup.dump

-- Recreate indexes
CREATE INDEX CONCURRENTLY idx_patients_searches_gin ON patients USING GIN (searches);
```

---

**🔄 Last Updated**: September 29, 2025  
**✅ Schema Status**: Migration required for JSONB columns  
**🚨 Next Update Required**: After schema migration completion