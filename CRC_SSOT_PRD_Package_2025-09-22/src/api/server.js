import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pg from 'pg';
import dotenv from 'dotenv';
import PersistenceManager from './persistence.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.API_PORT || 3001;

// Initialize Persistence Manager
const persistence = new PersistenceManager({
  DB_HOST: process.env.DB_HOST || '100.112.67.23',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'emr_crc_ssot',
  DB_USER: process.env.DB_USER || 'emr_admin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'emr_secure_2024',
  FALLBACK_PATH: join(__dirname, 'data', 'fallback')  // 🔧 FIX: Dynamic path resolution
});

// Keep original database connection pool for legacy endpoints
const pool = new Pool({
  host: process.env.DB_HOST || '100.112.67.23',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emr_crc_ssot',
  user: process.env.DB_USER || 'emr_admin',
  password: process.env.DB_PASSWORD || 'emr_secure_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration for healthcare environment
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Healthcare-Context'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Shared helpers
function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function normalizeJsonField(raw, defaultValue = []) {
  if (!raw) return Array.isArray(defaultValue) ? [...defaultValue] : defaultValue;
  if (Array.isArray(raw) || typeof raw === 'object') {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    // Handle legacy MAT needs string values by converting them to JSON objects
    const rawStr = String(raw).replace(/['"]/g, ''); // Remove quotes
    const matNeedsMap = {
      'MethadoneContinue': { type: 'MethadoneContinue', status: 'active' },
      'MethadoneInduction': { type: 'MethadoneInduction', status: 'pending' },
      'SuboxoneInduction': { type: 'SuboxoneInduction', status: 'pending' },
      'SuboxoneContinue': { type: 'SuboxoneContinue', status: 'active' },
      'None': {}
    };
    
    if (matNeedsMap[rawStr]) {
      return matNeedsMap[rawStr];
    }
    
    console.warn('⚠️ Failed to parse JSON field – falling back to default:', error.message);
    return Array.isArray(defaultValue) ? [...defaultValue] : defaultValue;
  }
}

// Health check endpoint with persistence status
app.get('/health', async (req, res) => {
  try {
    const health = await persistence.healthCheck();
    const legacyDbTest = await pool.query('SELECT NOW()');
    
    res.json({
      status: health.database ? 'healthy' : 'degraded',
      database: health.database ? 'connected' : 'disconnected',
      fallback: health.fallback ? 'available' : 'unavailable',
      syncNeeded: health.syncNeeded,
      timestamp: legacyDbTest.rows[0]?.now || new Date().toISOString(),
      service: 'CRC SSOT EMR API',
      persistenceHealth: health
    });
  } catch (error) {
    const health = await persistence.healthCheck();
    res.status(503).json({
      status: health.fallback ? 'degraded' : 'critical',
      database: 'disconnected',
      fallback: health.fallback ? 'available' : 'unavailable',
      error: error.message,
      persistenceHealth: health
    });
  }
});

// 💾 PERSISTENT API ENDPOINTS

// Save Patient Data (with full persistence)
app.post('/api/patients', async (req, res) => {
  try {
    console.log('💾 Saving patient data:', req.body);
    const result = await persistence.savePatient(req.body);
    
    res.json({
      success: true,
      message: `Patient saved via ${result.method}`,
      data: result.data,
      method: result.method,
      timestamp: result.timestamp,
      warning: result.warning
    });
    
  } catch (error) {
    console.error('❌ Error saving patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save patient',
      message: error.message
    });
  }
});

// Update Patient Data
app.put('/api/patients/:id', async (req, res) => {
  try {
    const patientData = { ...req.body, id: req.params.id };
    const result = await persistence.savePatient(patientData);
    
    res.json({
      success: true,
      message: `Patient updated via ${result.method}`,
      data: result.data,
      method: result.method,
      warning: result.warning
    });
    
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient',
      message: error.message
    });
  }
});

// Save Assessment Data
app.post('/api/assessments', async (req, res) => {
  try {
    console.log('📝 Saving assessment data:', req.body);
    const result = await persistence.saveAssessment(req.body);
    
    res.json({
      success: true,
      message: `Assessment saved via ${result.method}`,
      data: result.data,
      method: result.method,
      warning: result.warning
    });
    
  } catch (error) {
    console.error('❌ Error saving assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save assessment',
      message: error.message
    });
  }
});

// Save Facility Placement Attempt
app.post('/api/placements', async (req, res) => {
  try {
    console.log('🏥 Saving placement attempt:', req.body);
    const result = await persistence.savePlacementAttempt(req.body);
    
    res.json({
      success: true,
      message: `Placement saved via ${result.method}`,
      data: result.data,
      method: result.method,
      warning: result.warning
    });
    
  } catch (error) {
    console.error('❌ Error saving placement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save placement',
      message: error.message
    });
  }
});

// Health Check Endpoint - Database Connectivity Test
app.get('/api/health', async (req, res) => {
  try {
    const health = await persistence.healthCheck();
    
    res.json({
      success: true,
      status: 'healthy',
      database: health.database,
      fallback: health.fallback,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Sync Fallback Data
app.post('/api/sync', async (req, res) => {
  try {
    console.log('🔄 Starting data synchronization...');
    const results = await persistence.syncFallbackData();
    
    res.json({
      success: true,
      message: 'Synchronization completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    res.status(500).json({
      success: false,
      error: 'Synchronization failed',
      message: error.message
    });
  }
});

// Get Assessments for a Patient
app.get('/api/patients/:id/assessments', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Fetching assessments for patient: ${id}`);
    
    // Assessment data is stored IN the patients table, not a separate table
    // Try database first
    try {
      const query = `
        SELECT 
          patient_id,
          id,
          asam_level,
          level_of_care,
          commitment_status,
          admission_status,
          medical_acuity,
          mat_needs,
          updated_at,
          created_at
        FROM patients 
        WHERE id = $1 OR patient_id::text = $1
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length > 0) {
        const patient = result.rows[0];
        
        // Format as assessment object for frontend
        const assessment = {
          patientId: patient.id || `pt_${patient.patient_id}`,
          asamLevel: patient.asam_level,
          levelOfCare: patient.level_of_care,
          commitmentStatus: patient.commitment_status,
          admissionStatus: patient.admission_status,
          medicalAcuity: patient.medical_acuity,
          matNeeds: patient.mat_needs,
          updatedAt: patient.updated_at,
          createdAt: patient.created_at
        };
        
        console.log(`✅ Found assessment data for ${id} from database`);
        res.json({
          success: true,
          data: [assessment], // Array for consistency
          method: 'database',
          count: 1
        });
        return;
      }
    } catch (dbError) {
      console.log('❌ Database query failed, checking fallback:', dbError.message);
    }
    
    // Fallback to local patient files
    try {
      const patients = await persistence.getAllFromFallback('patients');
      const patient = patients.find(p => p.id === id);
      
      if (patient) {
        const assessment = {
          patientId: patient.id,
          asamLevel: patient.asamLevel || patient.asam_level,
          levelOfCare: patient.levelOfCare || patient.level_of_care,
          commitmentStatus: patient.commitmentStatus || patient.commitment_status,
          admissionStatus: patient.admissionStatus || patient.admission_status,
          medicalAcuity: patient.medicalAcuity || patient.medical_acuity,
          matNeeds: patient.matNeeds || patient.mat_needs,
          updatedAt: patient.updatedAt || patient.updated_at,
          createdAt: patient.createdAt || patient.created_at
        };
        
        console.log(`✅ Found assessment data for ${id} from fallback`);
        res.json({
          success: true,
          data: [assessment],
          method: 'fallback',
          count: 1,
          warning: 'Using local fallback data'
        });
        return;
      }
    } catch (fallbackError) {
      console.log('❌ Fallback query failed:', fallbackError.message);
    }
    
    // No data found
    res.json({
      success: true,
      data: [],
      method: 'none',
      count: 0,
      warning: 'No assessment data found for this patient'
    });
    
  } catch (error) {
    console.error('❌ Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments',
      message: error.message
    });
  }
});

// Patient Management APIs (Enhanced with Persistence)
app.get('/api/patients', async (req, res) => {
  try {
    console.log('📋 Fetching all patients...');
    const result = await persistence.getAllPatients();
    
    if (result.success) {
      const patients = result.data.map((patient) => {
        const searches = normalizeJsonField(coalesce(patient.searches, patient.search_history?.searches), []);
        
        // Handle different name formats
        let patientName;
        const lastName = coalesce(patient.last_name, patient.lastName);
        const firstName = coalesce(patient.first_name, patient.firstName);
        const singleName = patient.name;
        
        // Priority: 1) firstName/lastName, 2) single name field, 3) Unknown
        if (lastName || firstName) {
          patientName = `${lastName || 'Unknown'}, ${firstName || 'Unknown'}`;
        } else if (singleName) {
          patientName = singleName;
        } else {
          patientName = `Unknown (${patient.id})`;
        }
        
        return {
          id: patient.id,
          name: patientName,
          mrn: coalesce(patient.mrn, patient.medical_record_number, patient.mrnNumber, 'No MRN'),
          dateOfBirth: coalesce(patient.date_of_birth, patient.dateOfBirth, null),
          status: coalesce(patient.admission_status, patient.admissionStatus, 'Unknown'),
          asamLevel: coalesce(patient.asam_level, patient.asamLevel, null),
          levelOfCare: coalesce(patient.level_of_care, patient.levelOfCare, null),
          commitmentStatus: coalesce(patient.commitment_status, patient.commitmentStatus, null),
          lastUpdated: coalesce(patient.updated_at, patient.updatedAt, patient.lastUpdated, null),
          searchCount: Array.isArray(searches) ? searches.length : 0,
          searches: searches,        // ✅ Primary field - matches database schema
          bedSearches: searches,     // ✅ Backwards compatibility
          searchHistory: coalesce(patient.searchHistory, patient.search_history, []),
        };
      });
      
      console.log(`✅ Found ${patients.length} patients via ${result.method}`);
      
      res.json({
        success: true,
        count: patients.length,
        data: patients,
        method: result.method,
        warning: result.warning
      });
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    
    // Fallback to test data if everything fails
    const testPatients = [
      {
        id: 'test-001',
        name: 'Anderson, Michael J.',
        mrn: 'MRN001234',
        status: 'Active',
        asamLevel: '3.5',
        commitmentStatus: '302',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'test-002',
        name: 'Brown, Sarah K.',
        mrn: 'MRN002345',
        status: 'Pending',
        asamLevel: '3.7',
        commitmentStatus: '201',
        lastUpdated: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      count: testPatients.length,
      data: testPatients,
      method: 'test-data',
      warning: 'Using test data - both database and fallback unavailable'
    });
  }
});

// Get specific patient
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await persistence.getPatient(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const patient = result.data;
    const searches = normalizeJsonField(coalesce(patient.searches, patient.search_history?.searches), []);
    let searchHistory = normalizeJsonField(coalesce(patient.search_history, patient.searchHistory), []);

    if ((!Array.isArray(searchHistory) || searchHistory.length === 0) && Array.isArray(searches)) {
      searchHistory = searches.flatMap((search) => {
        const facilityName = coalesce(search.facilityName, search.facility_name, '');
        const status = coalesce(search.status, search.state, '');
        const entries = Array.isArray(search.history) ? search.history : [];

        return entries.map((entry) => ({
          ts: coalesce(entry.ts, entry.timestamp, search.updated, search.created),
          status,
          facility: facilityName,
          detail: coalesce(entry.detail, entry.message, entry.action, '')
        }));
      });
    }

    res.json({
      success: true,
      method: result.method,
      data: {
        id: patient.id,
        firstName: coalesce(patient.first_name, patient.firstName),
        lastName: coalesce(patient.last_name, patient.lastName),
        name: `${coalesce(patient.last_name, patient.lastName, '')}, ${coalesce(patient.first_name, patient.firstName, '')}`.trim(),
        mrn: coalesce(patient.mrn, patient.medical_record_number, patient.mrnNumber),
        dateOfBirth: coalesce(patient.date_of_birth, patient.dateOfBirth),
        admissionStatus: coalesce(patient.admission_status, patient.admissionStatus),
        asamLevel: coalesce(patient.asam_level, patient.asamLevel),
        levelOfCare: coalesce(patient.level_of_care, patient.levelOfCare),
        commitmentStatus: coalesce(patient.commitment_status, patient.commitmentStatus),
        medicalAcuity: coalesce(patient.medical_acuity, patient.medicalAcuity),
        matNeeds: normalizeJsonField(coalesce(patient.mat_needs, patient.matNeeds), {}),
        insurancePrimary: coalesce(patient.insurance_primary, patient.insurancePrimary),
        insuranceSecondary: coalesce(patient.insurance_secondary, patient.insuranceSecondary),
        emergencyContactName: coalesce(patient.emergency_contact_name, patient.emergencyContactName),
        emergencyContactPhone: coalesce(patient.emergency_contact_phone, patient.emergencyContactPhone),
        searches,
        searchHistory,
        lastSync: coalesce(patient.last_sync, patient.lastSync),
        updatedAt: coalesce(patient.updated_at, patient.updatedAt),
        createdAt: coalesce(patient.created_at, patient.createdAt)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient details',
      message: error.message
    });
  }
});

// Facility Management APIs
app.get('/api/facilities', async (req, res) => {
  try {
    console.log('🏥 Fetching facilities from database...');
    
    const query = `
      SELECT 
        id,
        facility_name,
        facility_type,
        address,
        city,
        state,
        zip_code,
        phone_number,
        bed_capacity,
        current_occupancy,
        accepts_mat,
        accepts_302,
        asam_levels_supported,
        created_at
      FROM facilities
      WHERE active = true
      ORDER BY facility_name
    `;
    
    const result = await pool.query(query);
    
    const facilities = result.rows.map(facility => ({
      id: facility.id,
      name: facility.facility_name,
      type: facility.facility_type,
      address: {
        street: facility.address,
        city: facility.city,
        state: facility.state,
        zip: facility.zip_code
      },
      phone: facility.phone_number,
      capacity: facility.bed_capacity,
      occupancy: facility.current_occupancy,
      availability: facility.bed_capacity - facility.current_occupancy,
      services: {
        mat: facility.accepts_mat,
        commitment302: facility.accepts_302,
        asamLevels: facility.asam_levels_supported || []
      }
    }));
    
    console.log(`✅ Found ${facilities.length} facilities`);
    
    res.json({
      success: true,
      count: facilities.length,
      data: facilities,
      method: 'database'
    });
    
  } catch (error) {
    console.error('❌ Error fetching facilities:', error.message);
    
    // Fallback to hardcoded facilities data
    console.log('🔄 Using fallback facilities data...');
    
    const fallbackFacilities = [
      {
        id: 'fac_001',
        name: 'Pennsylvania Hospital - Behavioral Health',
        type: 'Inpatient Psychiatric',
        address: { street: '800 Spruce St', city: 'Philadelphia', state: 'PA', zip: '19107' },
        phone: '(215) 829-3000',
        capacity: 45,
        occupancy: 38,
        availability: 7,
        services: { mat: true, commitment302: true, asamLevels: ['3.5', '3.7', '4.0'] }
      },
      {
        id: 'fac_002', 
        name: 'Thomas Jefferson University Hospital - Psych',
        type: 'Inpatient Psychiatric',
        address: { street: '111 S 11th St', city: 'Philadelphia', state: 'PA', zip: '19107' },
        phone: '(215) 955-6000',
        capacity: 32,
        occupancy: 29,
        availability: 3,
        services: { mat: false, commitment302: true, asamLevels: ['3.5', '3.7'] }
      },
      {
        id: 'fac_003',
        name: 'Temple University Hospital - Behavioral Health',
        type: 'Inpatient Psychiatric', 
        address: { street: '3401 N Broad St', city: 'Philadelphia', state: 'PA', zip: '19140' },
        phone: '(215) 707-2000',
        capacity: 28,
        occupancy: 25,
        availability: 3,
        services: { mat: true, commitment302: true, asamLevels: ['3.5', '3.7', '4.0'] }
      },
      {
        id: 'fac_004',
        name: 'Einstein Medical Center - Psychiatric Services',
        type: 'Inpatient Psychiatric',
        address: { street: '5501 Old York Rd', city: 'Philadelphia', state: 'PA', zip: '19141' },
        phone: '(215) 456-7890',
        capacity: 36,
        occupancy: 31,
        availability: 5,
        services: { mat: true, commitment302: true, asamLevels: ['3.5', '3.7'] }
      },
      {
        id: 'fac_005',
        name: 'Horsham Clinic',
        type: 'Inpatient Psychiatric',
        address: { street: '722 E Butler Pike', city: 'Ambler', state: 'PA', zip: '19002' },
        phone: '(215) 643-7800',
        capacity: 208,
        occupancy: 189,
        availability: 19,
        services: { mat: true, commitment302: true, asamLevels: ['3.5', '3.7', '4.0'] }
      }
    ];
    
    console.log(`✅ Found ${fallbackFacilities.length} fallback facilities`);
    
    res.json({
      success: true,
      count: fallbackFacilities.length,
      data: fallbackFacilities,
      method: 'fallback',
      warning: 'Using fallback facility data - database unavailable'
    });
  }
});

// Staff Management APIs
app.get('/api/staff', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        role,
        department,
        email,
        phone,
        active
      FROM staff
      WHERE active = true
      ORDER BY last_name, first_name
    `;
    
    const result = await pool.query(query);
    
    const staff = result.rows.map(member => ({
      id: member.id,
      name: `${member.last_name}, ${member.first_name}`,
      role: member.role,
      department: member.department,
      email: member.email,
      phone: member.phone
    }));
    
    res.json({
      success: true,
      count: staff.length,
      data: staff
    });
    
  } catch (error) {
    console.error('❌ Error fetching staff:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff',
      message: error.message
    });
  }
});

// Search APIs
app.get('/api/search/patients', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        medical_record_number,
        admission_status
      FROM patients
      WHERE 
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        medical_record_number LIKE $1
      ORDER BY last_name, first_name
      LIMIT 20
    `;
    
    const result = await pool.query(query, [`%${q}%`]);
    
    const patients = result.rows.map(patient => ({
      id: patient.id,
      name: `${patient.last_name}, ${patient.first_name}`,
      mrn: patient.medical_record_number,
      status: patient.admission_status
    }));
    
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
    
  } catch (error) {
    console.error('❌ Error searching patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search patients',
      message: error.message
    });
  }
});

// Analytics APIs
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const queries = {
      totalPatients: 'SELECT COUNT(*) as count FROM patients',
      activeAdmissions: 'SELECT COUNT(*) as count FROM patients WHERE admission_status = \'Active\'',
      totalFacilities: 'SELECT COUNT(*) as count FROM facilities WHERE active = true',
      pendingPlacements: 'SELECT COUNT(*) as count FROM patients WHERE admission_status = \'Pending Placement\''
    };
    
    const results = await Promise.all([
      pool.query(queries.totalPatients),
      pool.query(queries.activeAdmissions),
      pool.query(queries.totalFacilities),
      pool.query(queries.pendingPlacements)
    ]);
    
    res.json({
      success: true,
      data: {
        totalPatients: parseInt(results[0].rows[0].count),
        activeAdmissions: parseInt(results[1].rows[0].count),
        totalFacilities: parseInt(results[2].rows[0].count),
        pendingPlacements: parseInt(results[3].rows[0].count),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 CRC SSOT EMR API Server Started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Healthcare API ready for EMR operations`);
  console.log(`🔒 Security headers enabled`);
  console.log(`📊 Database pool configured`);
});

export default app;
