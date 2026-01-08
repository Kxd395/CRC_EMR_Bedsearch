# 🔍 EMR Database Schema Verification Report

**Date**: September 30, 2025  
**Purpose**: Verify database schema matches application data requirements  
**Focus**: Patient data fields, bed searches, and update tracking

---

## ⚠️ **CRITICAL FINDING: SCHEMA MISMATCH**

### **Problem Identified**

There are **TWO DIFFERENT database schemas** in the project:

1. **Normalized Schema** (production/old handoff) - Separate tables for searches
2. **JSONB Schema** (config/database/local_schema.sql) - Searches stored as JSON in patient table

**Current Application Expects**: JSONB Schema (searches stored in patient record)

---

## 📊 **SCHEMA COMPARISON**

### **Schema 1: Normalized (Old Production Schema)**

**Location**: `/production/database/restore_points/.../schema_original.sql`

**Structure**:
```sql
patients table:
  - patient_id (UUID)
  - mrn (TEXT)
  - first_name (TEXT)
  - last_name (TEXT)
  - date_of_birth (DATE)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)

placement_search table (SEPARATE):
  - placement_search_id (UUID)
  - patient_id (UUID) → Foreign key to patients
  - facility_id (UUID)
  - facility_name (TEXT)
  - status (ENUM: draft, sent, waiting, accepted, denied, no_beds, transfer_set, closed)
  - is_accepting (BOOLEAN)
  - is_transfer_set (BOOLEAN)
  - is_open (GENERATED)
  - search_origin (TEXT)
  - notes_summary (TEXT)
  - created_by (UUID)
  - last_updated_at (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)

placement_notes table:
  - note_id (UUID)
  - placement_search_id (UUID)
  - author_id (UUID)
  - body (TEXT)
  - metadata (JSONB)
  - created_at (TIMESTAMPTZ)

audit_log table:
  - audit_id (UUID)
  - table_name (TEXT)
  - operation (TEXT)
  - old_values (JSONB)
  - new_values (JSONB)
  - user_id (UUID)
  - user_ip (INET)
  - created_at (TIMESTAMPTZ)
```

**Pros**:
- ✅ Normalized design (database best practice)
- ✅ HIPAA audit logging built-in
- ✅ Referential integrity enforced
- ✅ Efficient queries with indexes
- ✅ Type safety with ENUMs

**Cons**:
- ❌ Requires JOINs to get patient with searches
- ❌ More complex queries
- ❌ **Doesn't match current application code**

---

### **Schema 2: JSONB (Current Local Schema)**

**Location**: `/config/database/local_schema.sql`

**Structure**:
```sql
patients table:
  - patient_id (UUID)
  - first_name (TEXT)
  - last_name (TEXT)
  - date_of_birth (DATE)
  - mrn (TEXT)
  - asam_level (TEXT)
  - level_of_care (TEXT)
  - commitment_status (TEXT)
  - admission_status (TEXT)
  - medical_acuity (TEXT)
  - mat_needs (JSONB) ✅
  - insurance_primary (TEXT)
  - insurance_secondary (TEXT)
  - emergency_contact_name (TEXT)
  - emergency_contact_phone (TEXT)
  - searches (JSONB) ✅ ← BED SEARCHES STORED HERE
  - search_history (JSONB) ✅ ← HISTORY STORED HERE
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ) ✅ ← UPDATE TRACKING

facilities table:
  - facility_id (UUID)
  - name (TEXT)
  - city (TEXT)
  - state (TEXT)
  - phone (TEXT)
  - facility_type (TEXT)
  - accepts_302 (BOOLEAN)
  - accepts_mat (BOOLEAN)
  - accepts_secure (BOOLEAN)
  - metadata (JSONB)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Pros**:
- ✅ **Matches current application code** (server.js, fallback data)
- ✅ Simple queries (no JOINs needed)
- ✅ Flexible schema (JSON can evolve)
- ✅ Faster single-patient retrieval
- ✅ All patient data in one place

**Cons**:
- ❌ Not normalized (database purists don't like it)
- ❌ No HIPAA audit logging table
- ❌ Harder to query across all searches
- ❌ No type safety for search status

---

## ✅ **FIELD VERIFICATION: Current Application Requirements**

Based on `pt_501.json` fallback data, here's what the application needs:

### **Patient Core Fields**

| Field | Type | In JSONB Schema | In Normalized Schema | Status |
|-------|------|-----------------|---------------------|--------|
| id | TEXT | ✅ patient_id (UUID) | ✅ patient_id (UUID) | ✅ Both have it |
| firstName | TEXT | ✅ first_name | ✅ first_name | ✅ Both have it |
| lastName | TEXT | ✅ last_name | ✅ last_name | ✅ Both have it |
| dateOfBirth | DATE | ✅ date_of_birth | ✅ date_of_birth | ✅ Both have it |
| mrn | TEXT | ✅ mrn | ✅ mrn | ✅ Both have it |
| admissionStatus | TEXT | ✅ admission_status | ❌ **MISSING** | ⚠️ Only in JSONB |
| asamLevel | TEXT | ✅ asam_level | ❌ **MISSING** | ⚠️ Only in JSONB |
| levelOfCare | TEXT | ✅ level_of_care | ❌ **MISSING** | ⚠️ Only in JSONB |
| commitmentStatus | TEXT | ✅ commitment_status | ❌ **MISSING** | ⚠️ Only in JSONB |
| medicalAcuity | TEXT | ✅ medical_acuity | ❌ **MISSING** | ⚠️ Only in JSONB |
| matNeeds | JSONB | ✅ mat_needs (JSONB) | ❌ **MISSING** | ⚠️ Only in JSONB |
| insurancePrimary | TEXT | ✅ insurance_primary | ❌ **MISSING** | ⚠️ Only in JSONB |
| insuranceSecondary | TEXT | ✅ insurance_secondary | ❌ **MISSING** | ⚠️ Only in JSONB |
| emergencyContactName | TEXT | ✅ emergency_contact_name | ❌ **MISSING** | ⚠️ Only in JSONB |
| emergencyContactPhone | TEXT | ✅ emergency_contact_phone | ❌ **MISSING** | ⚠️ Only in JSONB |

### **Bed Search Fields** ⭐ **CRITICAL**

| Field | Type | In JSONB Schema | In Normalized Schema | Status |
|-------|------|-----------------|---------------------|--------|
| searches | JSONB Array | ✅ searches (JSONB) | ❌ Separate table | ⚠️ **SCHEMA MISMATCH** |
| searchHistory | JSONB Array | ✅ search_history (JSONB) | ❌ Not tracked | ⚠️ Only in JSONB |

**Bed Search Object Structure** (from pt_501.json):
```json
{
  "id": "pt_501-01",
  "facilityId": "EAGLEVILLE",
  "facilityName": "Eagleville",
  "status": "WaitingTransport",
  "updated": "09/24 10:15",
  "created": "09/24 09:00",
  "channels": ["phone"],
  "summary": "Bed confirmed, transport scheduled.",
  "assignedTo": "mlee",
  "timeBucket": "today",
  "actionTags": ["waiting_transport", "verify_insurance"],
  "events": [...]
}
```

**Current Application Expects**:
- `searches` array in patient record (JSONB)
- `searchHistory` array in patient record (JSONB)
- `updated` timestamp on each search
- Full event history in `events` array

### **Update Tracking Fields** ⭐ **CRITICAL**

| Field | Type | In JSONB Schema | In Normalized Schema | Status |
|-------|------|-----------------|---------------------|--------|
| updatedAt | TIMESTAMPTZ | ✅ updated_at | ✅ updated_at | ✅ Both have it |
| createdAt | TIMESTAMPTZ | ✅ created_at | ✅ created_at | ✅ Both have it |
| lastSync | TIMESTAMPTZ | ❌ **MISSING** | ❌ **MISSING** | ⚠️ App adds this |

**Auto-Update Trigger**: ✅ JSONB schema has trigger to update `updated_at` on changes

---

## 🚨 **CRITICAL ISSUES FOUND**

### **Issue 1: Schema Mismatch Between Database and Application** 🔴

**Problem**: The production database may be using the normalized schema (separate `placement_search` table), but the application code expects JSONB schema (searches in patient record).

**Evidence**:
- `server.js` line 327-347: Code expects `patient.searches` and `patient.search_history`
- Fallback data uses JSONB structure
- `config/database/local_schema.sql` defines JSONB structure

**Impact**:
- ❌ API queries will fail if database uses normalized schema
- ❌ Data won't display correctly in UI
- ❌ Bed searches won't link to patients

**Solution Needed**:
1. **Option A**: Migrate database to JSONB schema (matches current code)
2. **Option B**: Update application code to work with normalized schema (requires rewrite)

**Recommendation**: Use JSONB schema (Option A) because:
- ✅ Code already written for it
- ✅ Simpler for single-user application
- ✅ Faster development velocity
- ❌ Can add audit logging table separately

---

### **Issue 2: Missing Clinical Fields in Normalized Schema** 🟡

**Problem**: Normalized schema missing critical healthcare fields:
- `asam_level` (addiction severity)
- `level_of_care` (treatment level)
- `commitment_status` (legal status - 302 holds)
- `admission_status` (workflow state)
- `medical_acuity` (medical monitoring needs)
- `mat_needs` (medication-assisted treatment)
- Insurance fields
- Emergency contact fields

**Impact**:
- ❌ Can't store complete patient clinical data
- ❌ Missing fields needed for placement decisions
- ❌ Incomplete medical records

**Solution**: Add these fields to normalized schema if using it, OR use JSONB schema which has them.

---

### **Issue 3: No Search History Tracking in Normalized Schema** 🟡

**Problem**: Normalized schema tracks individual searches in separate table, but doesn't maintain a `searchHistory` array like the application expects.

**Current App Uses**:
```json
"searchHistory": [
  {
    "ts": "Sep 29, 05:29 PM",
    "status": "accepted",
    "facility": "Fairmount",
    "detail": "New search added from facility directory."
  }
]
```

**Impact**:
- ❌ Can't show historical timeline of search attempts
- ❌ Loses context of placement workflow
- ❌ UI Assessment Overview tab won't work

**Solution**: Either use JSONB schema OR create view to generate searchHistory from placement_search table.

---

## ✅ **RECOMMENDED DATABASE SCHEMA**

### **Use the JSONB Schema with Enhancements**

**Why**:
1. ✅ Matches current application code
2. ✅ Has all required clinical fields
3. ✅ Stores searches with patient (simple queries)
4. ✅ Tracks update timestamps
5. ✅ Has GIN indexes for JSONB performance

**Add Missing Components**:
1. ✅ Add HIPAA audit logging table (from normalized schema)
2. ✅ Add views for reporting across all searches
3. ✅ Add check constraints for data validation

**Enhanced Schema**:
```sql
-- Use existing JSONB schema from config/database/local_schema.sql
-- PLUS add from normalized schema:

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

-- View to extract all searches across patients
CREATE OR REPLACE VIEW v_all_searches AS
SELECT 
  p.patient_id,
  p.first_name,
  p.last_name,
  p.mrn,
  s.value->>'id' as search_id,
  s.value->>'facilityId' as facility_id,
  s.value->>'facilityName' as facility_name,
  s.value->>'status' as status,
  s.value->>'updated' as updated,
  s.value->>'created' as created,
  p.updated_at
FROM patients p,
LATERAL jsonb_array_elements(p.searches) s;

-- Index for fast search queries
CREATE INDEX IF NOT EXISTS idx_patients_searches_status 
ON patients USING GIN ((searches::jsonb));
```

---

## 📋 **ACTION ITEMS**

### **Before Fixing pg_hba.conf**

- [ ] **CRITICAL**: Verify which schema is actually in the database
- [ ] SSH to Linux server and run: `psql -U postgres -d emr_crc_ssot -c "\d patients"`
- [ ] Check if `searches` column exists (JSONB schema)
- [ ] OR check if `placement_search` table exists (normalized schema)

### **After Database Connection Fixed**

- [ ] Run schema verification query
- [ ] Compare actual schema with expected schema
- [ ] If wrong schema, run migration to JSONB schema
- [ ] Apply enhanced schema (audit_log, views)
- [ ] Test patient data retrieval with searches
- [ ] Verify searches appear in API response
- [ ] Test UI Assessment Overview tab

### **Migration Script Needed** (if database has normalized schema)

```sql
-- Migration from normalized to JSONB schema
-- WARNING: Test on backup first!

-- Add missing columns to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS asam_level TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS level_of_care TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS commitment_status TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS admission_status TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_acuity TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_primary TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_secondary TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS searches JSONB DEFAULT '[]'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb;

-- Migrate placement_search data to JSONB searches array
-- (Complex migration - needs careful planning)
```

---

## 🎯 **VERIFICATION CHECKLIST**

Once database connection is fixed, run these queries:

### **1. Check Schema Type**
```sql
-- Check if searches column exists (JSONB schema)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' AND column_name = 'searches';

-- Check if placement_search table exists (normalized schema)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'placement_search';
```

### **2. Verify All Required Fields**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;
```

**Expected Columns** (JSONB schema):
- patient_id, first_name, last_name, date_of_birth, mrn
- asam_level, level_of_care, commitment_status, admission_status
- medical_acuity, mat_needs, insurance_primary, insurance_secondary
- emergency_contact_name, emergency_contact_phone
- **searches (JSONB)** ← BED SEARCHES
- **search_history (JSONB)** ← HISTORY
- created_at, **updated_at** ← UPDATE TRACKING

### **3. Test Patient with Searches**
```sql
-- Insert test patient with searches
INSERT INTO patients (
  first_name, last_name, mrn, asam_level, 
  searches, search_history, updated_at
) VALUES (
  'Test', 'Patient', 'TEST001', '3.7',
  '[{"id": "test-01", "facilityName": "Test Facility", "status": "sent"}]'::jsonb,
  '[{"ts": "2025-09-30", "status": "sent", "facility": "Test Facility"}]'::jsonb,
  now()
);

-- Retrieve with searches
SELECT first_name, last_name, searches, search_history, updated_at
FROM patients WHERE mrn = 'TEST001';
```

---

## 📊 **SUMMARY**

### **Current Status**: ⚠️ **SCHEMA UNCERTAINTY**

- ✅ Application code expects JSONB schema
- ✅ Fallback data uses JSONB structure  
- ✅ `config/database/local_schema.sql` defines JSONB schema
- ❓ **UNKNOWN**: What schema is actually in the database on 100.112.67.23?

### **Required Actions**:

1. **FIRST**: Fix pg_hba.conf (from handoff package)
2. **SECOND**: Connect to database and verify schema
3. **THIRD**: If wrong schema, migrate to JSONB schema
4. **FOURTH**: Test patient data with bed searches
5. **FIFTH**: Verify UI displays correctly

### **Risk Assessment**:

- 🔴 **HIGH RISK**: If database has normalized schema, application won't work
- 🟡 **MEDIUM RISK**: Missing clinical fields in normalized schema
- 🟢 **LOW RISK**: JSONB schema matches application perfectly

---

**Report Created**: September 30, 2025  
**Status**: Awaiting database connection to verify actual schema  
**Next Step**: Execute handoff package to fix pg_hba.conf, then verify schema
