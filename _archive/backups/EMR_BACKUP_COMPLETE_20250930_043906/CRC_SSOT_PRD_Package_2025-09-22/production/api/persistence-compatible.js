/**
 * 🏥 EMR CRC SSOT - Simplified Persistence Layer (Compatible Mode)
 * Handles persistence with fallback for missing JSONB columns
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const { Pool } = pg;

export class PersistenceManager {
  constructor(config = {}) {
    this.pool = new Pool({
      host: config.DB_HOST || '100.112.67.23',
      port: config.DB_PORT || 5432,
      database: config.DB_NAME || 'emr_crc_ssot',
      user: config.DB_USER || 'emr_admin',
      password: config.DB_PASSWORD || 'emr_secure_2024',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.fallbackPath = config.FALLBACK_PATH || './data/fallback';
    this.ensureFallbackDir();
  }

  async ensureFallbackDir() {
    try {
      await fs.mkdir(this.fallbackPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create fallback directory:', error);
    }
  }

  /**
   * 🏥 Save Patient Data (Compatible with existing schema + fallback for searches)
   */
  async savePatient(patientData) {
    const patientId = patientData.id || this.generateId();
    const timestamp = new Date().toISOString();

    try {
      // First, try to save basic patient data to database (without JSONB columns)
      const basicQuery = `
        INSERT INTO patients (
          patient_id, first_name, last_name, date_of_birth, mrn,
          asam_level, level_of_care, commitment_status,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT (patient_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          asam_level = EXCLUDED.asam_level,
          level_of_care = EXCLUDED.level_of_care,
          commitment_status = EXCLUDED.commitment_status,
          updated_at = EXCLUDED.updated_at
        RETURNING *;
      `;

      const basicValues = [
        patientId,
        patientData.firstName,
        patientData.lastName,
        patientData.dateOfBirth,
        patientData.mrn,
        patientData.asamLevel,
        patientData.levelOfCare,
        patientData.commitmentStatus,
        timestamp,
        timestamp
      ];

      const result = await this.pool.query(basicQuery, basicValues);
      console.log(`✅ Basic patient data saved to database: ${patientId}`);

      // Save searches and extended data to fallback files
      if (patientData.searches || patientData.searchHistory || patientData.matNeeds) {
        const extendedData = {
          searches: patientData.searches || [],
          searchHistory: patientData.searchHistory || [],
          matNeeds: patientData.matNeeds || {},
          insurancePrimary: patientData.insurancePrimary,
          insuranceSecondary: patientData.insuranceSecondary,
          emergencyContactName: patientData.emergencyContactName,
          emergencyContactPhone: patientData.emergencyContactPhone,
          medicalAcuity: patientData.medicalAcuity,
          admissionStatus: patientData.admissionStatus,
          lastUpdated: timestamp
        };

        await this.saveFallback('patients_extended', patientId, extendedData);
        console.log(`✅ Extended patient data saved to fallback: ${patientId}`);
      }

      return {
        success: true,
        data: result.rows[0],
        method: 'hybrid'
      };

    } catch (error) {
      console.error('❌ Database save failed, using full fallback:', error.message);
      
      // Full fallback - save everything to files
      const fallbackData = {
        ...patientData,
        id: patientId,
        createdAt: timestamp,
        updatedAt: timestamp,
        persistenceMethod: 'fallback'
      };

      await this.saveFallback('patients', patientId, fallbackData);
      
      return {
        success: true,
        data: fallbackData,
        method: 'fallback',
        warning: 'Saved to local fallback due to database error'
      };
    }
  }

  /**
   * 🔍 Load Patient Data (Database + fallback merge)
   */
  async loadPatient(patientId) {
    try {
      // Load basic data from database
      const query = 'SELECT * FROM patients WHERE patient_id = $1';
      const result = await this.pool.query(query, [patientId]);
      
      let patientData = result.rows[0];

      if (patientData) {
        // Load extended data from fallback
        const extendedData = await this.loadFallback('patients_extended', patientId);
        if (extendedData) {
          patientData = {
            ...patientData,
            searches: extendedData.searches || [],
            searchHistory: extendedData.searchHistory || [],
            matNeeds: extendedData.matNeeds || {},
            insurancePrimary: extendedData.insurancePrimary,
            insuranceSecondary: extendedData.insuranceSecondary,
            emergencyContactName: extendedData.emergencyContactName,
            emergencyContactPhone: extendedData.emergencyContactPhone,
            medicalAcuity: extendedData.medicalAcuity,
            admissionStatus: extendedData.admissionStatus
          };
        }

        return {
          success: true,
          data: patientData,
          method: 'hybrid'
        };
      } else {
        // Try fallback only
        const fallbackData = await this.loadFallback('patients', patientId);
        if (fallbackData) {
          return {
            success: true,
            data: fallbackData,
            method: 'fallback'
          };
        }
      }

      return {
        success: false,
        error: 'Patient not found'
      };

    } catch (error) {
      console.error('❌ Load failed, trying fallback:', error.message);
      
      const fallbackData = await this.loadFallback('patients', patientId);
      if (fallbackData) {
        return {
          success: true,
          data: fallbackData,
          method: 'fallback'
        };
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📁 Save to fallback files
   */
  async saveFallback(type, id, data) {
    try {
      const filename = path.join(this.fallbackPath, `${type}_${id}.json`);
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`📁 Fallback saved: ${filename}`);
    } catch (error) {
      console.error('❌ Fallback save failed:', error);
      throw error;
    }
  }

  /**
   * 📂 Load from fallback files
   */
  async loadFallback(type, id) {
    try {
      const filename = path.join(this.fallbackPath, `${type}_${id}.json`);
      const content = await fs.readFile(filename, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      // File doesn't exist or can't be read - not an error
      return null;
    }
  }

  /**
   * 📋 Load all patients
   */
  async loadAllPatients() {
    try {
      const query = 'SELECT * FROM patients ORDER BY last_name, first_name';
      const result = await this.pool.query(query);
      
      // Merge with extended data for each patient
      const patients = [];
      for (const patient of result.rows) {
        const extendedData = await this.loadFallback('patients_extended', patient.patient_id);
        if (extendedData) {
          patients.push({
            ...patient,
            ...extendedData
          });
        } else {
          patients.push({
            ...patient,
            searches: [],
            searchHistory: [],
            matNeeds: {}
          });
        }
      }

      return {
        success: true,
        data: patients,
        method: 'hybrid'
      };

    } catch (error) {
      console.error('❌ Database load failed, using fallback:', error.message);
      
      // Load all fallback files
      try {
        const files = await fs.readdir(this.fallbackPath);
        const patientFiles = files.filter(f => f.startsWith('patients_') && f.endsWith('.json') && !f.includes('extended'));
        
        const patients = [];
        for (const file of patientFiles) {
          const content = await fs.readFile(path.join(this.fallbackPath, file), 'utf8');
          patients.push(JSON.parse(content));
        }

        return {
          success: true,
          data: patients,
          method: 'fallback'
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'No data available'
        };
      }
    }
  }

  /**
   * 🏥 Health Check
   */
  async healthCheck() {
    try {
      // Test database connection
      const result = await this.pool.query('SELECT 1');
      return {
        success: true,
        database: 'connected',
        fallback: 'available'
      };
    } catch (error) {
      return {
        success: false,
        database: 'disconnected',
        fallback: 'available',
        error: error.message
      };
    }
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default PersistenceManager;