# EMR SSOT Field Mapping & Verification
# Single Source of Truth - Field Consistency Check
# Created: September 30, 2025

## ✅ SSOT VERIFICATION SUMMARY

**Status**: ⚠️ **FIELD MISMATCH DETECTED - NEEDS FIX**

---

## 🔍 FIELD MAPPING ANALYSIS

### **Database Schema (PostgreSQL)**
```sql
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,        -- ❌ MISMATCH: Code uses 'id'
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    asam_level VARCHAR(10),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    admission_status VARCHAR(50),
    medical_acuity VARCHAR(100),
    mat_needs JSONB DEFAULT '{}',
    insurance_primary VARCHAR(200),
    insurance_secondary VARCHAR(200),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    searches JSONB DEFAULT '[]',
    search_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### **Fallback JSON Structure (Current Data)**
```json
{
  "id": "pt_501",                      // ❌ MISMATCH: DB uses 'patient_id'
  "firstName": "Dana",                 // ✅ Maps to 'first_name'
  "lastName": "Nguyen",                // ✅ Maps to 'last_name'
  "dateOfBirth": null,                 // ✅ Maps to 'date_of_birth'
  "mrn": "2025501",                    // ✅ Matches
  "admissionStatus": "waiting_transport", // ✅ Maps to 'admission_status'
  "asamLevel": "3.7WM",                // ✅ Maps to 'asam_level'
  "levelOfCare": "Y",                  // ✅ Maps to 'level_of_care'
  "commitmentStatus": "302Hold",       // ✅ Maps to 'commitment_status'
  "medicalAcuity": "Medically Monitored", // ✅ Maps to 'medical_acuity'
  "matNeeds": { "type": "...", ... },  // ✅ Maps to 'mat_needs' (JSONB)
  "insurancePrimary": null,            // ✅ Maps to 'insurance_primary'
  "insuranceSecondary": null,          // ✅ Maps to 'insurance_secondary'
  "emergencyContactName": null,        // ✅ Maps to 'emergency_contact_name'
  "emergencyContactPhone": null,       // ✅ Maps to 'emergency_contact_phone'
  "searches": [ {...}, {...} ],        // ✅ Maps to 'searches' (JSONB)
  "searchHistory": [ {...} ],          // ❌ MISMATCH: DB uses 'search_history'
  "updatedAt": "2025-09-29T..."        // ✅ Maps to 'updated_at'
}
```

### **Persistence.js INSERT Query**
```javascript
INSERT INTO patients (
  id,                        // ❌ WRONG: Should be 'patient_id' or remove
  first_name,                // ✅ Correct
  last_name,                 // ✅ Correct
  date_of_birth,             // ✅ Correct
  mrn,                       // ✅ Correct
  admission_status,          // ✅ Correct
  asam_level,                // ✅ Correct
  level_of_care,             // ✅ Correct
  commitment_status,         // ✅ Correct
  medical_acuity,            // ✅ Correct
  mat_needs,                 // ✅ Correct
  insurance_primary,         // ✅ Correct
  insurance_secondary,       // ✅ Correct
  emergency_contact_name,    // ✅ Correct
  emergency_contact_phone,   // ✅ Correct
  searches,                  // ✅ Correct
  created_at,                // ✅ Correct
  updated_at,                // ✅ Correct
  last_sync                  // ❌ MISSING: Not in schema
)
```

---

## 🚨 CRITICAL ISSUES FOUND

### **Issue 1: Primary Key Mismatch**
- **Database Schema**: Uses `patient_id` (SERIAL PRIMARY KEY)
- **Code Expects**: Uses `id` 
- **Impact**: INSERT/UPDATE queries will fail
- **Fix Required**: ✅ Update schema to add `id` column OR update code to use `patient_id`

### **Issue 2: Missing Columns in Schema**
- **Missing**: `last_sync` column used in persistence.js
- **Missing**: `search_history` column (code uses `searchHistory`)
- **Impact**: INSERT queries will fail
- **Fix Required**: ✅ Add these columns to schema

### **Issue 3: CamelCase vs snake_case Inconsistency**
- **JSON Data**: Uses camelCase (`searchHistory`, `updatedAt`)
- **Database**: Uses snake_case (`search_history`, `updated_at`)
- **Current Handling**: Code should map between formats
- **Impact**: Data mapping issues if not handled

---

## ✅ RECOMMENDED FIXES

### **Fix 1: Update Database Schema (RECOMMENDED)**

Add missing fields to match the application code:

```sql
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS id VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE;

-- Set id to match pattern
UPDATE patients SET id = 'pt_' || patient_id WHERE id IS NULL;

-- Create index on id for performance
CREATE INDEX IF NOT EXISTS idx_patients_id ON patients(id);
```

### **Fix 2: Ensure Field Mapping in Code**

The persistence.js should handle camelCase ↔ snake_case conversion:

```javascript
// When reading from DB
const patient = {
  id: row.id || `pt_${row.patient_id}`,
  firstName: row.first_name,
  lastName: row.last_name,
  dateOfBirth: row.date_of_birth,
  mrn: row.mrn,
  admissionStatus: row.admission_status,
  asamLevel: row.asam_level,
  levelOfCare: row.level_of_care,
  commitmentStatus: row.commitment_status,
  medicalAcuity: row.medical_acuity,
  matNeeds: row.mat_needs,
  insurancePrimary: row.insurance_primary,
  insuranceSecondary: row.insurance_secondary,
  emergencyContactName: row.emergency_contact_name,
  emergencyContactPhone: row.emergency_contact_phone,
  searches: row.searches,
  searchHistory: row.search_history,
  updatedAt: row.updated_at,
  createdAt: row.created_at
};
```

### **Fix 3: Update Setup Scripts**

All database setup scripts need the complete schema:

```sql
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    id VARCHAR(50) UNIQUE,              -- ✅ ADD THIS
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Clinical Fields
    asam_level VARCHAR(10),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    admission_status VARCHAR(50),
    medical_acuity VARCHAR(100),
    mat_needs JSONB DEFAULT '{}',
    
    -- Insurance
    insurance_primary VARCHAR(200),
    insurance_secondary VARCHAR(200),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Bed Search Tracking (JSONB)
    searches JSONB DEFAULT '[]',
    search_history JSONB DEFAULT '[]',  -- ✅ KEEP THIS
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP WITH TIME ZONE  -- ✅ ADD THIS
);
```

---

## 📋 VERIFICATION CHECKLIST

After fixes are applied, verify:

- [ ] Database schema has `id` column
- [ ] Database schema has `last_sync` column
- [ ] Database schema has `search_history` column (already present)
- [ ] INSERT queries succeed without errors
- [ ] SELECT queries return data in expected format
- [ ] Field mapping handles camelCase ↔ snake_case
- [ ] Updated setup scripts include all fields
- [ ] Test patient creation from UI
- [ ] Test patient retrieval from database
- [ ] Test bed search updates

---

## 🔧 NEXT STEPS

1. **Update database setup scripts** with complete schema
2. **Add migration script** to fix existing database
3. **Update persistence.js** to ensure field mapping
4. **Run complete setup** on database server
5. **Test end-to-end** patient data flow

---

## 📊 SSOT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Fallback JSON | ✅ Complete | All fields present |
| Database Schema | ⚠️ Incomplete | Missing `id`, `last_sync` |
| Persistence Code | ⚠️ Mismatch | Uses fields not in schema |
| Setup Scripts | ⚠️ Incomplete | Missing columns |
| Field Mapping | ❌ Inconsistent | camelCase vs snake_case |

**Overall SSOT Status**: ⚠️ **NEEDS FIXING** before database will work correctly