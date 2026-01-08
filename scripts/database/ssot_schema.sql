-- EMR Database SSOT-Compliant Schema
-- Created: September 30, 2025
-- Includes all fields required by persistence.js

-- Drop existing tables for clean setup
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with COMPLETE SSOT schema
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    id VARCHAR(50) UNIQUE,                    -- SSOT REQUIRED: Application ID (pt_xxx format)
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Clinical Assessment Fields
    asam_level VARCHAR(10),
    level_of_care VARCHAR(50),
    commitment_status VARCHAR(50),
    admission_status VARCHAR(50),
    medical_acuity VARCHAR(100),
    
    -- MAT (Medication-Assisted Treatment) Needs
    mat_needs JSONB DEFAULT '{}',
    
    -- Insurance Information
    insurance_primary VARCHAR(200),
    insurance_secondary VARCHAR(200),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Bed Search Data (JSONB arrays for tracking)
    searches JSONB DEFAULT '[]',              -- All bed searches for this patient
    search_history JSONB DEFAULT '[]',        -- Complete search timeline
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- SSOT REQUIRED
);

-- Create facilities directory
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    facility_name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(100),
    level_of_care VARCHAR(50),
    beds_available INTEGER DEFAULT 0,
    accepts_mat BOOLEAN DEFAULT false,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log for HIPAA compliance
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id INTEGER,
    user_id VARCHAR(100),
    changed_data JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indexes (SSOT REQUIRED)
CREATE INDEX idx_patients_id ON patients(id);                                    -- SSOT: For app ID lookups
CREATE INDEX idx_patients_mrn ON patients(mrn);                                 -- For MRN lookups
CREATE INDEX idx_patients_last_name ON patients(last_name);                     -- For name searches
CREATE INDEX idx_patients_searches ON patients USING GIN (searches);            -- For bed search queries
CREATE INDEX idx_patients_search_history ON patients USING GIN (search_history);-- For history queries
CREATE INDEX idx_patients_updated_at ON patients(updated_at DESC);              -- For recent updates
CREATE INDEX idx_patients_asam ON patients(asam_level);                         -- For clinical filtering
CREATE INDEX idx_patients_commitment ON patients(commitment_status);            -- For status filtering
CREATE INDEX idx_patients_admission ON patients(admission_status);              -- For admission filtering
CREATE INDEX idx_facilities_name ON facilities(facility_name);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_lol ON facilities(level_of_care);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Create auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant all necessary permissions to emr_admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO emr_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO emr_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO emr_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO emr_admin;
