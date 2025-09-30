/**
 * 🏥 EMR CRC SSOT - Comprehensive Persistence Layer
 * Handles all data persistence for the EMR system
 * Created: September 28, 2025
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const { Pool } = pg;

export class PersistenceManager {
  constructor(config = {}) {
    this.pool = new Pool({
      host: config.DB_HOST || 'localhost',
      port: config.DB_PORT || 5432,
      database: config.DB_NAME || 'emr_crc_ssot',
      user: config.DB_USER || 'emr_admin',
      password: config.DB_PASSWORD || 'secure_password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    this.fallbackPath = config.FALLBACK_PATH || './data/fallback';
    this.ensureFallbackDir();
  }

  async ensureFallbackDir() {
    try {
      await fs.mkdir(this.fallbackPath, { recursive: true });
    } catch (error) {
      console.error('❌ Failed to create fallback directory:', error);
    }
  }

  /**
   * 💾 Save Patient Data with Full Persistence
   */
  async savePatient(patientData) {
    const timestamp = new Date().toISOString();
    const patientId = patientData.id || this.generateId();

    try {
      // Try database first
      const query = `
        INSERT INTO patients (
          id, first_name, last_name, date_of_birth, mrn,
          admission_status, asam_level, level_of_care, 
          commitment_status, medical_acuity, mat_needs,
          insurance_primary, insurance_secondary,
          emergency_contact_name, emergency_contact_phone,
          searches, search_history, created_at, updated_at, last_sync
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          admission_status = EXCLUDED.admission_status,
          asam_level = EXCLUDED.asam_level,
          level_of_care = EXCLUDED.level_of_care,
          commitment_status = EXCLUDED.commitment_status,
          medical_acuity = EXCLUDED.medical_acuity,
          mat_needs = EXCLUDED.mat_needs,
          insurance_primary = EXCLUDED.insurance_primary,
          insurance_secondary = EXCLUDED.insurance_secondary,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          searches = EXCLUDED.searches,
          search_history = EXCLUDED.search_history,
          updated_at = EXCLUDED.updated_at,
          last_sync = EXCLUDED.last_sync
        RETURNING *;
      `;

      const values = [
        patientId,
        patientData.firstName,
        patientData.lastName,
        patientData.dateOfBirth,
        patientData.mrn,
        patientData.admissionStatus,
        patientData.asamLevel,
        patientData.levelOfCare,
        patientData.commitmentStatus,
        patientData.medicalAcuity,
        JSON.stringify(patientData.matNeeds || {}),
        patientData.insurancePrimary,
        patientData.insuranceSecondary,
        patientData.emergencyContactName,
        patientData.emergencyContactPhone,
        JSON.stringify(patientData.searches || []),
        JSON.stringify(patientData.searchHistory || []),
        timestamp,
        timestamp,
        timestamp
      ];

      const result = await this.pool.query(query, values);
      console.log(`✅ Patient ${patientId} saved to database`);
      
      // Also save to fallback
      await this.saveFallback('patients', patientId, result.rows[0]);
      
      return {
        success: true,
        data: result.rows[0],
        method: 'database',
        timestamp
      };

    } catch (error) {
      console.error('❌ Database save failed, using fallback:', error.message);
      
      // Fallback to file system
      const fallbackData = {
        ...patientData,
        id: patientId,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastSync: timestamp,
        persistenceMethod: 'fallback'
      };

      await this.saveFallback('patients', patientId, fallbackData);
      
      return {
        success: true,
        data: fallbackData,
        method: 'fallback',
        timestamp,
        warning: 'Saved to local fallback - will sync when database is available'
      };
    }
  }

  /**
   * 📝 Save Assessment Data
   */
  async saveAssessment(assessmentData) {
    const timestamp = new Date().toISOString();
    
    try {
      // Try database first  
      const assessmentId = assessmentData.id || this.generateId();
      const query = `
        INSERT INTO assessments (
          id, patient_id, assessment_type, assessment_date,
          assessment_results, asam_recommendation, notes,
          created_by, created_at, updated_at, last_sync
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        ON CONFLICT (id) DO UPDATE SET
          assessment_results = EXCLUDED.assessment_results,
          asam_recommendation = EXCLUDED.asam_recommendation,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at,
          last_sync = EXCLUDED.last_sync
        RETURNING *;
      `;

      const values = [
        assessmentId,
        assessmentData.patientId,
        assessmentData.assessmentType,
        assessmentData.assessmentDate || timestamp,
        JSON.stringify(assessmentData.results || {}),
        assessmentData.asamRecommendation,
        assessmentData.notes,
        assessmentData.createdBy,
        timestamp,
        timestamp,
        timestamp
      ];

      const result = await this.pool.query(query, values);
      await this.saveFallback('assessments', assessmentId, result.rows[0]);
      
      return {
        success: true,
        data: result.rows[0],
        method: 'database'
      };

    } catch (error) {
      console.error('❌ Assessment save failed, using fallback:', error.message);
      
      // Fallback with proper upsert logic
      return await this.saveAssessmentFallback(assessmentData, timestamp);
    }
  }

  /**
   * 💾 Save Assessment to Fallback with Upsert Logic
   */
  async saveAssessmentFallback(assessmentData, timestamp) {
    const patientId = assessmentData.patientId;
    
    // Find existing assessment for this patient (most recent one)
    const existingAssessments = await this.getAllFromFallback('assessments');
    const patientAssessments = existingAssessments
      .filter(a => (a.patientId === patientId || a.patient_id === patientId))
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    let assessmentId;
    let isUpdate = false;

    if (patientAssessments.length > 0) {
      // Update the most recent assessment
      const mostRecent = patientAssessments[0];
      assessmentId = mostRecent.id;
      isUpdate = true;
      console.log(`🔄 Updating existing assessment ${assessmentId} for patient ${patientId}`);
    } else {
      // Create new assessment
      assessmentId = assessmentData.id || this.generateId();
      console.log(`✨ Creating new assessment ${assessmentId} for patient ${patientId}`);
    }

    const fallbackData = {
      ...assessmentData,
      id: assessmentId,
      patientId: patientId, // Ensure consistent field name
      patient_id: patientId, // Keep both for compatibility
      createdAt: isUpdate ? (patientAssessments[0]?.createdAt || patientAssessments[0]?.created_at || timestamp) : timestamp,
      updatedAt: timestamp,
      lastSaved: timestamp,
      persistenceMethod: 'fallback'
    };

    await this.saveFallback('assessments', assessmentId, fallbackData);
    
    return {
      success: true,
      data: fallbackData,
      method: 'fallback',
      action: isUpdate ? 'updated' : 'created',
      warning: 'Saved to local fallback - will sync when database is available'
    };
  }

  /**
   * 🏥 Save Facility Search/Placement Data
   */
  async savePlacementAttempt(placementData) {
    const timestamp = new Date().toISOString();
    const placementId = placementData.id || this.generateId();

    try {
      const query = `
        INSERT INTO placement_attempts (
          id, patient_id, facility_id, search_criteria,
          status, notes, attempted_at, created_by,
          created_at, updated_at, last_sync
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at,
          last_sync = EXCLUDED.last_sync
        RETURNING *;
      `;

      const values = [
        placementId,
        placementData.patientId,
        placementData.facilityId,
        JSON.stringify(placementData.searchCriteria || {}),
        placementData.status,
        placementData.notes,
        placementData.attemptedAt || timestamp,
        placementData.createdBy,
        timestamp,
        timestamp,
        timestamp
      ];

      const result = await this.pool.query(query, values);
      await this.saveFallback('placements', placementId, result.rows[0]);
      
      return {
        success: true,
        data: result.rows[0],
        method: 'database'
      };

    } catch (error) {
      console.error('❌ Placement save failed, using fallback:', error.message);
      
      const fallbackData = {
        ...placementData,
        id: placementId,
        createdAt: timestamp,
        updatedAt: timestamp,
        persistenceMethod: 'fallback'
      };

      await this.saveFallback('placements', placementId, fallbackData);
      
      return {
        success: true,
        data: fallbackData,
        method: 'fallback',
        warning: 'Saved to local fallback'
      };
    }
  }

  /**
   * 🔄 Sync Fallback Data to Database
   */
  async syncFallbackData() {
    const syncResults = {
      patients: { synced: 0, failed: 0 },
      assessments: { synced: 0, failed: 0 },
      placements: { synced: 0, failed: 0 }
    };

    try {
      // Test database connection first
      await this.pool.query('SELECT 1');
      console.log('🔄 Starting fallback data synchronization...');

      for (const dataType of ['patients', 'assessments', 'placements']) {
        const fallbackFiles = await this.getFallbackFiles(dataType);
        
        for (const file of fallbackFiles) {
          try {
            const data = await this.loadFallback(dataType, file);
            if (data.persistenceMethod === 'fallback') {
              // Attempt to sync to database
              let result;
              switch (dataType) {
                case 'patients':
                  result = await this.savePatient(data);
                  break;
                case 'assessments':
                  result = await this.saveAssessment(data);
                  break;
                case 'placements':
                  result = await this.savePlacementAttempt(data);
                  break;
              }
              
              if (result.method === 'database') {
                syncResults[dataType].synced++;
                // Remove fallback file after successful sync
                await this.removeFallback(dataType, file);
              } else {
                syncResults[dataType].failed++;
              }
            }
          } catch (error) {
            console.error(`❌ Failed to sync ${dataType}/${file}:`, error.message);
            syncResults[dataType].failed++;
          }
        }
      }

      console.log('✅ Sync completed:', syncResults);
      return syncResults;

    } catch (error) {
      console.error('❌ Database not available for sync:', error.message);
      return { error: 'Database not available', details: syncResults };
    }
  }

  /**
   * 📁 Fallback File System Operations
   */
  async saveFallback(type, id, data) {
    const filePath = path.join(this.fallbackPath, type, `${id}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async loadFallback(type, id) {
    const filePath = path.join(this.fallbackPath, type, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async removeFallback(type, id) {
    const filePath = path.join(this.fallbackPath, type, `${id}.json`);
    await fs.unlink(filePath);
  }

  async getFallbackFiles(type) {
    try {
      const dirPath = path.join(this.fallbackPath, type);
      const files = await fs.readdir(dirPath);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * 🔍 Data Retrieval Methods
   */
  async getPatient(id) {
    try {
      const result = await this.pool.query('SELECT * FROM patients WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        return { success: true, data: result.rows[0], method: 'database' };
      }
    } catch (error) {
      console.error('❌ Database query failed, checking fallback:', error.message);
    }

    // Try fallback
    try {
      const data = await this.loadFallback('patients', id);
      return { success: true, data, method: 'fallback' };
    } catch (error) {
      return { success: false, error: 'Patient not found' };
    }
  }

  async getAllPatients() {
    try {
      const result = await this.pool.query('SELECT * FROM patients ORDER BY updated_at DESC');
      return { success: true, data: result.rows, method: 'database' };
    } catch (error) {
      console.error('❌ Database query failed, using fallback data:', error.message);
      
      // Aggregate fallback data
      const fallbackFiles = await this.getFallbackFiles('patients');
      const patients = [];
      
      for (const file of fallbackFiles) {
        try {
          const data = await this.loadFallback('patients', file);
          patients.push(data);
        } catch (err) {
          console.error(`❌ Failed to load fallback patient ${file}:`, err.message);
        }
      }
      
      return { 
        success: true, 
        data: patients, 
        method: 'fallback',
        warning: 'Using local fallback data - database unavailable'
      };
    }
  }

  async getAllFromFallback(type) {
    const fallbackFiles = await this.getFallbackFiles(type);
    const items = [];
    
    for (const file of fallbackFiles) {
      try {
        const data = await this.loadFallback(type, file);
        items.push(data);
      } catch (err) {
        console.error(`❌ Failed to load fallback ${type} ${file}:`, err.message);
      }
    }
    
    // Sort by creation date (most recent first)
    return items.sort((a, b) => 
      new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
    );
  }

  /**
   * 🛠️ Utility Methods
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  async healthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      database: false,
      fallback: false,
      syncNeeded: false
    };

    // Test database
    try {
      await this.pool.query('SELECT 1');
      health.database = true;
    } catch (error) {
      health.databaseError = error.message;
    }

    // Test fallback
    try {
      await fs.access(this.fallbackPath);
      health.fallback = true;
      
      // Check if sync is needed
      const types = ['patients', 'assessments', 'placements'];
      for (const type of types) {
        const files = await this.getFallbackFiles(type);
        if (files.length > 0) {
          health.syncNeeded = true;
          break;
        }
      }
    } catch (error) {
      health.fallbackError = error.message;
    }

    return health;
  }

  async close() {
    await this.pool.end();
  }
}

export default PersistenceManager;