# 🌐 EMR CRC SSOT - API Reference (SSOT)

**Last Updated**: September 29, 2025  
**API Version**: 1.0  
**Base URL**: `http://localhost:3001` (Development) | `https://your-domain.com` (Production)

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:
- ✅ New endpoint added
- ✅ Endpoint method changed  
- ✅ Request/response format modified
- ✅ Authentication requirements change
- ✅ Error codes updated
- ✅ Rate limits modified

## 📡 Base Configuration

### Environment Variables Required

```bash
API_PORT=3001
NODE_ENV=development
DB_HOST=100.112.67.23
DB_PORT=5432
DB_NAME=emr_crc_ssot
DB_USER=emr_admin
DB_PASSWORD=emr_secure_2024
```

### Headers Required

```http
Content-Type: application/json
Authorization: Bearer <token> (if authentication enabled)
```

## 🏥 Healthcare Data Endpoints

### GET /api/health

**Purpose**: Health check and system status

**Request**:
```http
GET /api/health
```

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "database": false,
  "fallback": true,
  "timestamp": "2025-09-29T19:23:24.701Z"
}
```

**Status Codes**:
- `200`: Service healthy
- `503`: Service unavailable

---

### GET /api/patients

**Purpose**: Retrieve all patients with healthcare data

**Request**:
```http
GET /api/patients
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pt_501",
      "firstName": "Dana", 
      "lastName": "Nguyen",
      "dateOfBirth": "1998-03-15",
      "mrn": "MRN789012",
      "admissionStatus": "Admitted",
      "asamLevel": "3.5",
      "levelOfCare": "Residential",
      "commitmentStatus": "Voluntary",
      "medicalAcuity": "Low",
      "matNeeds": {
        "type": "SuboxoneContinue",
        "dosage": "8mg",
        "frequency": "Daily"
      },
      "searches": [
        {
          "id": "S501-01",
          "facilityId": "FAC001",
          "facilityName": "Liberty Mid-Atlantic",
          "status": "Pending",
          "created": "09/29 14:30",
          "updated": "09/29 14:30",
          "events": []
        }
      ],
      "searchHistory": [
        {
          "ts": "09/29 14:30",
          "status": "Pending", 
          "facility": "Liberty Mid-Atlantic",
          "detail": "Search initiated from facility directory."
        }
      ]
    }
  ],
  "count": 27,
  "method": "fallback"
}
```

**Status Codes**:
- `200`: Success
- `500`: Server error

---

### GET /api/patients/:id

**Purpose**: Retrieve specific patient by ID

**Request**:
```http
GET /api/patients/pt_501
```

**Response**: Same structure as single patient in `/api/patients` array

**Status Codes**:
- `200`: Patient found
- `404`: Patient not found
- `500`: Server error

---

### PUT /api/patients/:id

**Purpose**: Update patient data including searches and assessments

**Request**:
```http
PUT /api/patients/pt_501
Content-Type: application/json

{
  "id": "pt_501",
  "firstName": "Dana",
  "lastName": "Nguyen", 
  "searches": [
    {
      "id": "S501-01",
      "facilityId": "FAC001",
      "facilityName": "Liberty Mid-Atlantic",
      "status": "Pending"
    }
  ],
  "searchHistory": [
    {
      "ts": "09/29 14:30",
      "status": "Pending",
      "facility": "Liberty Mid-Atlantic", 
      "detail": "Search initiated"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "pt_501",
    "updatedAt": "2025-09-29T19:31:36.248Z",
    "lastSync": "2025-09-29T19:31:36.248Z"
  },
  "method": "database"
}
```

**Fallback Response** (when database unavailable):
```json
{
  "success": true,
  "message": "Patient updated via fallback",
  "data": { "...": "patient_data" },
  "method": "fallback",
  "warning": "Saved to local fallback - will sync when database is available"
}
```

**Status Codes**:
- `200`: Update successful
- `400`: Invalid request data
- `404`: Patient not found
- `500`: Server error

---

### GET /api/patients/:id/assessments

**Purpose**: Retrieve assessments for specific patient

**Request**:
```http
GET /api/patients/pt_501/assessments
```

**Response**:
```json
{
  "success": true,
  "data": {
    "patientId": "pt_501",
    "assessments": [
      {
        "id": "ASMT001",
        "type": "ASAM",
        "level": "3.5",
        "timestamp": "2025-09-29T10:00:00Z",
        "assessor": "Dr. Smith"
      }
    ]
  }
}
```

**Status Codes**:
- `200`: Success
- `404`: Patient not found
- `500`: Server error

---

### POST /api/patients/:id/assessments

**Purpose**: Add new assessment for patient

**Request**:
```http
POST /api/patients/pt_501/assessments
Content-Type: application/json

{
  "type": "ASAM",
  "level": "3.7WM",
  "assessor": "Dr. Johnson",
  "notes": "Updated LOC based on medical stability"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Assessment added successfully",
  "data": {
    "assessmentId": "ASMT002",
    "patientId": "pt_501"
  }
}
```

**Status Codes**:
- `201`: Assessment created
- `400`: Invalid assessment data
- `404`: Patient not found
- `500`: Server error

## 🔒 Security Endpoints

### POST /api/auth/login

**Purpose**: Authenticate user (when auth is enabled)

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "healthcare_user",
  "password": "secure_password"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user123",
    "username": "healthcare_user",
    "role": "clinician"
  }
}
```

**Status Codes**:
- `200`: Login successful
- `401`: Invalid credentials
- `429`: Rate limit exceeded

## 📊 Data Models

### Patient Model

```typescript
interface Patient {
  id: string;                    // Unique identifier
  firstName: string;             // Patient first name
  lastName: string;              // Patient last name  
  dateOfBirth: string;           // YYYY-MM-DD format
  mrn: string;                   // Medical record number
  admissionStatus: string;       // Current admission status
  asamLevel: string;             // ASAM level of care
  levelOfCare: string;           // Current LOC
  commitmentStatus: string;      // Legal commitment status
  medicalAcuity: string;         // Medical acuity level
  matNeeds: MatNeeds;            // MAT requirements
  searches: Search[];            // Active placement searches
  searchHistory: SearchEvent[];  // Search timeline
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Search Model

```typescript
interface Search {
  id: string;                    // Search identifier
  facilityId: string;            // Target facility ID
  facilityName: string;          // Facility display name
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Waitlisted';
  created: string;               // MM/dd HH:mm format
  updated: string;               // MM/dd HH:mm format
  channels: string[];            // Communication channels
  summary: string;               // Search description
  assignedTo: string;            // Assigned staff member
  timeBucket: string;            // Timeline grouping
  events: SearchEvent[];         // Search timeline events
}
```

### MAT Needs Model

```typescript
interface MatNeeds {
  type: 'None' | 'MethadoneInduction' | 'MethadoneContinue' | 
        'SuboxoneInduction' | 'SuboxoneContinue' | 'DetoxOnly';
  dosage?: string;               // Current dosage
  frequency?: string;            // Dosing frequency
  provider?: string;             // MAT provider
  lastDose?: string;             // Last dose timestamp
}
```

## 🚨 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-09-29T19:31:36.248Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `PATIENT_NOT_FOUND` | 404 | Patient ID does not exist |
| `INVALID_REQUEST` | 400 | Malformed request data |
| `DATABASE_ERROR` | 500 | Database connection failure |
| `UNAUTHORIZED` | 401 | Authentication required |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Data validation failed |

## 🔄 Database Fallback System

When database is unavailable, API automatically switches to fallback mode:

1. **Reads**: Serve data from local JSON files
2. **Writes**: Save to local files, queue for sync
3. **Response**: Include `"method": "fallback"` and warning
4. **Recovery**: Auto-sync when database reconnects

## 📈 Performance Notes

- **Response Time**: < 100ms (database), < 20ms (fallback)
- **Rate Limits**: 1000 requests/minute per IP
- **Payload Limits**: 10MB max request size
- **Timeout**: 30 seconds for database operations

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Get All Patients

```bash
curl http://localhost:3001/api/patients
```

### Update Patient

```bash
curl -X PUT \
  http://localhost:3001/api/patients/pt_501 \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"John","lastName":"Updated"}'
```

---

**🔄 Last Updated**: September 29, 2025  
**✅ Status**: Current and accurate  
**🚨 Next Update Required**: When any endpoint changes