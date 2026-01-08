# 🚀 CRC SSOT EMR API - Production Ready

**API Status**: ✅ **100% Database Operational**  
**Base URL**: http://localhost:3001  
**Database**: PostgreSQL 14.16 (Local)  
**Last Updated**: September 28, 2025  

---

## 📊 **API Health Status**

**Current Status**: All endpoints operational with database persistence

### **Health Check**
```bash
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": true,
  "fallback": true,
  "timestamp": "2025-09-28T20:31:10.804Z"
}
```

---

## 🏥 **Patient Management API**

### **Create Patient**
```bash
POST /api/patients
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "mrn": "MRN_001",
  "dateOfBirth": "1985-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient saved via database",
  "method": "database",
  "data": {
    "id": "mg45724mggk82pfjf",
    "first_name": "John",
    "last_name": "Doe",
    "mrn": "MRN_001",
    "created_at": "2025-09-28T20:18:39.621Z"
  }
}
```

---

## 📋 **Assessment Management API**

### **Create Assessment**
```bash
POST /api/assessments
Content-Type: application/json

{
  "patientId": "mg45724mggk82pfjf",
  "assessmentType": "initial",
  "results": {"score": 90, "risk_level": "moderate"},
  "notes": "Initial assessment completed",
  "asamRecommendation": "Level 2.1",
  "createdBy": "clinician_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment saved via database",
  "method": "database",
  "data": {
    "id": "mg45qakzd39mzgq86",
    "patient_id": "mg45724mggk82pfjf",
    "assessment_type": "initial",
    "asam_recommendation": "Level 2.1",
    "created_at": "2025-09-28T20:19:39.621Z"
  }
}
```

### **Get Patient Assessments**
```bash
GET /api/patients/{patient_id}/assessments
```

---

## 🏢 **Placement Management API**

### **Create Placement Attempt**
```bash
POST /api/placements
Content-Type: application/json

{
  "patientId": "mg45724mggk82pfjf",
  "facilityId": "facility_123",
  "status": "attempted",
  "notes": "Placement attempt for level 2.1 care",
  "searchCriteria": {"location": "Philadelphia", "level": "2.1"},
  "createdBy": "coordinator_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Placement saved via database",
  "method": "database",
  "data": {
    "id": "mg45placement123",
    "patient_id": "mg45724mggk82pfjf",
    "facility_id": "facility_123",
    "status": "attempted",
    "created_at": "2025-09-28T20:20:39.621Z"
  }
}
```

---

## 🗄️ **Database Schema**

### **Patients Table**
```sql
patients (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_of_birth DATE,
  mrn VARCHAR(100) UNIQUE,
  admission_status VARCHAR(100),
  asam_level VARCHAR(50),
  level_of_care VARCHAR(100),
  commitment_status VARCHAR(100),
  medical_acuity VARCHAR(100),
  mat_needs JSONB,
  insurance_primary VARCHAR(255),
  insurance_secondary VARCHAR(255),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Assessments Table**
```sql
assessments (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  assessment_type VARCHAR(100),
  assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assessment_results JSONB,
  asam_recommendation VARCHAR(255),
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Placement Attempts Table**
```sql
placement_attempts (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  facility_id VARCHAR(255),
  search_criteria JSONB,
  status VARCHAR(100),
  notes TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 **API Configuration**

### **Environment Variables**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emr_crc_ssot
DB_USER=emr_admin
API_PORT=3001
NODE_ENV=development
```

### **Starting the API Server**
```bash
cd /path/to/production/api
node server.js
```

**Server Output:**
```
🚀 CRC SSOT EMR API Server Started
📡 Server running on http://localhost:3001
🏥 Healthcare API ready for EMR operations
🔒 Security headers enabled
📊 Database pool configured
```

---

## 📈 **Performance Metrics**

| Endpoint | Response Time | Database | Status |
|----------|---------------|----------|--------|
| GET /api/health | < 0.1s | ✅ Connected | ✅ Operational |
| POST /api/patients | < 0.1s | ✅ Persisted | ✅ Operational |
| POST /api/assessments | < 0.1s | ✅ Persisted | ✅ Operational |
| POST /api/placements | < 0.1s | ✅ Persisted | ✅ Operational |

---

## 🛡️ **Reliability Features**

### **Database-First Architecture**
- **Primary**: PostgreSQL database persistence
- **Backup**: Automatic fallback to JSON files if database unavailable
- **Recovery**: Automatic sync when database connection restored

### **Error Handling**
- **Database Errors**: Automatic fallback with warning messages
- **Connection Issues**: Graceful degradation to file-based persistence
- **Data Integrity**: Validation on all inputs

---

## 🧪 **Testing & Verification**

### **Quick Test Commands**
```bash
# Health check
curl -s "http://localhost:3001/api/health" | jq .

# Create test patient
curl -s -X POST "http://localhost:3001/api/patients" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"Patient","mrn":"TEST_001"}' | jq .

# Verify database
psql -U emr_admin -d emr_crc_ssot -c "SELECT COUNT(*) FROM patients;"
```

---

## 📞 **Support**

### **System Status**
- **Documentation**: [SYSTEM_STATUS.md](../SYSTEM_STATUS.md)
- **Verification Scripts**: `./final_verification.sh`
- **Health Monitor**: GET /api/health

### **Database Access**
- **Direct Connection**: `psql -U emr_admin -d emr_crc_ssot`
- **Health Check**: `./verify_database_connection.sh`

**✅ API Status**: Fully operational with 100% database persistence