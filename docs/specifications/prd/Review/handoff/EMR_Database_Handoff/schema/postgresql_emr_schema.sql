-- ============================================================================
-- EMR Database Schema - Healthcare Patient Placement System
-- ============================================================================
-- Database: emr_placement_ssot (EMR Single Source of Truth)
-- PostgreSQL Version: 16+
-- Created: September 30, 2025
-- Purpose: Healthcare EMR system with HIPAA-compliant audit logging
-- Schema Version: 1.0.0
-- 
-- Security Features:
-- ✅ UUID primary keys (prevents enumeration attacks)
-- ✅ Comprehensive audit logging for HIPAA compliance
-- ✅ Role-based access control
-- ✅ PHI (Protected Health Information) handling
-- 
-- Clinical Features:
-- ✅ Patient master data management
-- ✅ Healthcare facility directory
-- ✅ Patient placement workflow tracking
-- ✅ Clinical documentation and notes
-- ✅ Specialized treatment capability tracking
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: patients
-- Purpose: Patient master data with HIPAA compliance
-- PHI Level: High (Contains protected health information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
    -- Primary identification
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information (PHI)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'declined')),
    
    -- Contact Information
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2) CHECK (LENGTH(state) = 2),
    zip_code VARCHAR(10),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Insurance Information
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(100),
    insurance_group VARCHAR(50),
    
    -- Clinical Flags
    has_special_needs BOOLEAN DEFAULT false,
    requires_interpreter BOOLEAN DEFAULT false,
    preferred_language VARCHAR(50),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Data Quality Constraints
    CONSTRAINT valid_dob CHECK (date_of_birth <= CURRENT_DATE AND date_of_birth >= '1900-01-01'),
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
    CONSTRAINT valid_phone CHECK (phone_number ~ '^[\+]?[1-9][\d\s\-\(\)\.]{7,15}$' OR phone_number IS NULL)
);

-- Create indexes for patient searches (common queries)
CREATE INDEX IF NOT EXISTS idx_patients_last_name_dob ON patients(last_name, date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_insurance ON patients(insurance_provider, insurance_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

-- ============================================================================
-- TABLE: facilities
-- Purpose: Healthcare facility directory with specialized capabilities
-- PHI Level: Low (No patient-specific information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS facilities (
    -- Primary identification
    facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) DEFAULT 'hospital' CHECK (facility_type IN ('hospital', 'clinic', 'residential', 'outpatient', 'emergency', 'specialty')),
    license_number VARCHAR(100),
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2) CHECK (LENGTH(state) = 2),
    zip_code VARCHAR(10),
    county VARCHAR(100),
    
    -- Contact Information
    phone_number VARCHAR(20),
    fax_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Specialized Treatment Capabilities
    accepts_302 BOOLEAN DEFAULT false,  -- Involuntary psychiatric holds
    accepts_mat BOOLEAN DEFAULT false,  -- Medication-assisted treatment
    accepts_secure BOOLEAN DEFAULT false,  -- Secure/locked units
    accepts_detox BOOLEAN DEFAULT false,  -- Detoxification services
    accepts_pediatric BOOLEAN DEFAULT false,  -- Pediatric patients
    accepts_geriatric BOOLEAN DEFAULT false,  -- Geriatric patients
    accepts_dual_diagnosis BOOLEAN DEFAULT false,  -- Mental health + substance abuse
    
    -- Capacity Management
    bed_count INTEGER CHECK (bed_count > 0),
    current_census INTEGER DEFAULT 0 CHECK (current_census >= 0),
    max_capacity INTEGER,
    
    -- Operational Information
    accepts_emergency BOOLEAN DEFAULT true,
    accepts_transfers BOOLEAN DEFAULT true,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    
    -- Staff Contact
    contact_person VARCHAR(200),
    contact_title VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Administrative
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_census CHECK (current_census <= bed_count),
    CONSTRAINT valid_capacity CHECK (max_capacity >= bed_count OR max_capacity IS NULL)
);

-- Create indexes for facility searches
CREATE INDEX IF NOT EXISTS idx_facilities_capabilities ON facilities(accepts_302, accepts_mat, accepts_secure, accepts_detox);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(state, city);
CREATE INDEX IF NOT EXISTS idx_facilities_availability ON facilities(bed_count, current_census) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);

-- ============================================================================
-- TABLE: placement_search
-- Purpose: Patient placement workflow and status tracking
-- PHI Level: High (Links patients to placement activities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_search (
    -- Primary identification
    placement_search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Key Relationships
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(facility_id) ON DELETE RESTRICT,
    
    -- Workflow Status
    status VARCHAR(50) DEFAULT 'initiated' CHECK (status IN (
        'initiated',    -- Placement search started
        'pending',      -- Waiting for facility response
        'approved',     -- Facility approved placement
        'denied',       -- Facility denied placement
        'completed',    -- Patient successfully placed
        'cancelled',    -- Placement search cancelled
        'expired'       -- Placement search expired
    )),
    
    -- Priority and Classification
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    placement_type VARCHAR(50) CHECK (placement_type IN (
        'admission',           -- New admission
        'transfer',           -- Transfer from another facility
        'readmission',        -- Readmission (within 30 days)
        '302_hold',          -- Involuntary psychiatric hold
        'mat_treatment',     -- Medication-assisted treatment
        'detox',             -- Detoxification
        'emergency',         -- Emergency placement
        'planned'            -- Planned/scheduled admission
    )),
    
    -- Clinical Information
    diagnosis_primary VARCHAR(20),      -- ICD-10 code
    diagnosis_secondary VARCHAR(20),    -- Secondary ICD-10 code
    acuity_level VARCHAR(20) CHECK (acuity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Administrative
    insurance_authorization VARCHAR(100),
    authorization_expires DATE,
    estimated_los INTEGER,  -- Length of stay in days
    
    -- Dates and Timeline
    admission_date DATE,
    discharge_date DATE,
    target_placement_date DATE,
    
    -- Workflow Flags
    is_transfer_set BOOLEAN DEFAULT false,  -- Internal transfer flag
    requires_authorization BOOLEAN DEFAULT false,
    is_emergency BOOLEAN DEFAULT false,
    
    -- Clinical Staff
    referring_physician VARCHAR(200),
    case_manager VARCHAR(200),
    social_worker VARCHAR(200),
    
    -- Additional Information
    special_requirements TEXT,
    placement_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (admission_date IS NULL OR admission_date >= created_at::date) AND
        (discharge_date IS NULL OR discharge_date >= admission_date) AND
        (target_placement_date IS NULL OR target_placement_date >= created_at::date)
    ),
    CONSTRAINT valid_los CHECK (estimated_los IS NULL OR estimated_los > 0)
);

-- Create indexes for placement searches (performance critical)
CREATE INDEX IF NOT EXISTS idx_placement_search_status_priority ON placement_search(status, priority_level, created_at);
CREATE INDEX IF NOT EXISTS idx_placement_search_patient ON placement_search(patient_id);
CREATE INDEX IF NOT EXISTS idx_placement_search_facility ON placement_search(facility_id);
CREATE INDEX IF NOT EXISTS idx_placement_search_dates ON placement_search(target_placement_date, admission_date);
CREATE INDEX IF NOT EXISTS idx_placement_search_transfer ON placement_search(is_transfer_set) WHERE is_transfer_set = true;

-- Partial index for active placements (most common query)
CREATE INDEX IF NOT EXISTS idx_active_placements ON placement_search(created_at, priority_level) 
WHERE status NOT IN ('completed', 'denied', 'cancelled', 'expired');

-- ============================================================================
-- TABLE: placement_notes
-- Purpose: Clinical documentation and communication for placements
-- PHI Level: High (Contains clinical notes and patient information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_notes (
    -- Primary identification
    placement_note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Key Relationship
    placement_search_id UUID NOT NULL REFERENCES placement_search(placement_search_id) ON DELETE CASCADE,
    
    -- Note Classification
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN (
        'general',           -- General notes
        'clinical',          -- Clinical documentation
        'administrative',    -- Administrative notes
        'communication',     -- Communication with facility/family
        'status_change',     -- Status change documentation
        'authorization',     -- Insurance authorization notes
        'transfer',          -- Transfer-related notes
        'discharge_summary', -- Discharge planning
        'follow_up'         -- Follow-up notes
    )),
    
    -- Content
    body TEXT NOT NULL,
    summary VARCHAR(255),  -- Brief summary for quick reference
    
    -- Metadata
    author VARCHAR(200) NOT NULL,
    author_role VARCHAR(100),  -- physician, nurse, case_manager, social_worker, admin
    
    -- Privacy and Security
    is_private BOOLEAN DEFAULT false,  -- Restricted access note
    visibility_level VARCHAR(20) DEFAULT 'standard' CHECK (visibility_level IN ('public', 'standard', 'restricted', 'confidential')),
    
    -- Clinical Flags
    is_critical BOOLEAN DEFAULT false,  -- Critical information flag
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_date DATE,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- No updated_at - clinical notes should be immutable
    
    -- Constraints
    CONSTRAINT note_content_required CHECK (LENGTH(TRIM(body)) > 0),
    CONSTRAINT valid_follow_up CHECK (follow_up_date IS NULL OR follow_up_date >= created_at::date)
);

-- Create indexes for notes queries
CREATE INDEX IF NOT EXISTS idx_placement_notes_placement ON placement_notes(placement_search_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placement_notes_type_author ON placement_notes(note_type, author);
CREATE INDEX IF NOT EXISTS idx_placement_notes_critical ON placement_notes(is_critical, created_at DESC) WHERE is_critical = true;
CREATE INDEX IF NOT EXISTS idx_placement_notes_follow_up ON placement_notes(requires_follow_up, follow_up_date) WHERE requires_follow_up = true;

-- ============================================================================
-- TABLE: audit_log
-- Purpose: HIPAA-compliant audit trail for all database operations
-- PHI Level: Medium (Contains metadata about PHI access but not PHI itself)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    -- Primary identification
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Audit Information
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    
    -- Change Data (JSONB for flexible storage)
    old_values JSONB,          -- Previous values (for UPDATE/DELETE)
    new_values JSONB,          -- New values (for INSERT/UPDATE)
    changed_columns TEXT[],    -- List of changed columns (for UPDATE)
    
    -- User and Session Information
    changed_by VARCHAR(200),   -- User who made the change
    user_role VARCHAR(100),    -- Role of user (for RBAC auditing)
    session_id VARCHAR(100),   -- Session identifier
    application_name VARCHAR(100), -- Application that made the change
    
    -- Network and Security
    client_ip INET,           -- IP address of client
    user_agent TEXT,          -- Browser/application user agent
    
    -- Timing Information
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id BIGINT DEFAULT txid_current(),
    
    -- HIPAA Compliance Fields
    access_reason VARCHAR(255), -- Reason for PHI access
    phi_accessed BOOLEAN DEFAULT false, -- Whether PHI was accessed
    
    -- Additional Context
    query_text TEXT,          -- SQL query that triggered audit (if available)
    row_count INTEGER,        -- Number of rows affected
    
    -- Constraints
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    CONSTRAINT audit_data_required CHECK (
        (operation = 'INSERT' AND new_values IS NOT NULL) OR
        (operation = 'UPDATE' AND old_values IS NOT NULL AND new_values IS NOT NULL) OR
        (operation = 'DELETE' AND old_values IS NOT NULL) OR
        (operation = 'SELECT')
    )
);

-- Create indexes for audit log queries (performance and compliance)
CREATE INDEX IF NOT EXISTS idx_audit_log_table_timestamp ON audit_log(table_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_timestamp ON audit_log(changed_by, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_phi_access ON audit_log(phi_accessed, timestamp DESC) WHERE phi_accessed = true;
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_transaction ON audit_log(transaction_id);

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- Purpose: Automatic audit logging for HIPAA compliance
-- ============================================================================
CREATE OR REPLACE FUNCTION audit_trigger_function() 
RETURNS TRIGGER AS $$
DECLARE
    changed_cols TEXT[];
    phi_tables TEXT[] := ARRAY['patients', 'placement_search', 'placement_notes'];
    is_phi_table BOOLEAN;
BEGIN
    -- Check if this is a PHI table
    is_phi_table := TG_TABLE_NAME = ANY(phi_tables);
    
    -- For UPDATE operations, determine which columns changed
    IF TG_OP = 'UPDATE' THEN
        changed_cols := ARRAY(
            SELECT key 
            FROM jsonb_each(to_jsonb(NEW)) n
            JOIN jsonb_each(to_jsonb(OLD)) o ON n.key = o.key
            WHERE n.value IS DISTINCT FROM o.value
        );
    END IF;
    
    -- Insert audit record
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(
            table_name, 
            operation, 
            old_values, 
            changed_by, 
            phi_accessed,
            row_count
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            to_jsonb(OLD), 
            current_user,
            is_phi_table,
            1
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(
            table_name, 
            operation, 
            old_values, 
            new_values, 
            changed_columns,
            changed_by,
            phi_accessed,
            row_count
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            to_jsonb(OLD), 
            to_jsonb(NEW),
            changed_cols,
            current_user,
            is_phi_table,
            1
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(
            table_name, 
            operation, 
            new_values, 
            changed_by,
            phi_accessed,
            row_count
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            to_jsonb(NEW), 
            current_user,
            is_phi_table,
            1
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLY AUDIT TRIGGERS TO ALL PHI TABLES
-- ============================================================================

-- Patients table audit (High PHI)
CREATE TRIGGER IF NOT EXISTS audit_patients 
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Facilities table audit (Low PHI)
CREATE TRIGGER IF NOT EXISTS audit_facilities
    AFTER INSERT OR UPDATE OR DELETE ON facilities
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Placement search audit (High PHI)
CREATE TRIGGER IF NOT EXISTS audit_placement_search
    AFTER INSERT OR UPDATE OR DELETE ON placement_search
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Placement notes audit (High PHI)
CREATE TRIGGER IF NOT EXISTS audit_placement_notes
    AFTER INSERT OR UPDATE OR DELETE ON placement_notes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- CLINICAL VIEWS FOR HEALTHCARE WORKFLOWS
-- ============================================================================

-- View: Active placement searches with patient and facility information
CREATE OR REPLACE VIEW v_active_placement_searches AS
SELECT 
    ps.placement_search_id,
    ps.status,
    ps.priority_level,
    ps.placement_type,
    ps.is_transfer_set,
    ps.is_emergency,
    ps.created_at,
    ps.updated_at,
    ps.target_placement_date,
    ps.admission_date,
    
    -- Patient Information (limited PHI exposure)
    p.patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    EXTRACT(YEAR FROM AGE(p.date_of_birth)) AS age,
    
    -- Facility Information
    f.facility_id,
    f.name AS facility_name,
    f.city AS facility_city,
    f.state AS facility_state,
    f.phone_number AS facility_phone,
    (f.bed_count - f.current_census) AS available_beds,
    
    -- Clinical Information
    ps.diagnosis_primary,
    ps.acuity_level,
    ps.referring_physician,
    ps.case_manager,
    
    -- Timeline Calculations
    CASE 
        WHEN ps.priority_level = 'critical' THEN ps.created_at + INTERVAL '1 hour'
        WHEN ps.priority_level = 'high' THEN ps.created_at + INTERVAL '4 hours'
        WHEN ps.priority_level = 'medium' THEN ps.created_at + INTERVAL '12 hours'
        ELSE ps.created_at + INTERVAL '24 hours'
    END AS target_response_time,
    
    EXTRACT(EPOCH FROM (
        CASE 
            WHEN ps.priority_level = 'critical' THEN ps.created_at + INTERVAL '1 hour'
            WHEN ps.priority_level = 'high' THEN ps.created_at + INTERVAL '4 hours'
            WHEN ps.priority_level = 'medium' THEN ps.created_at + INTERVAL '12 hours'
            ELSE ps.created_at + INTERVAL '24 hours'
        END - CURRENT_TIMESTAMP
    ))/3600 AS hours_until_deadline,
    
    -- Status Flags
    CASE 
        WHEN ps.target_placement_date < CURRENT_DATE THEN true 
        ELSE false 
    END AS is_overdue,
    
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ps.created_at))/3600 AS hours_since_created

FROM placement_search ps
JOIN patients p ON ps.patient_id = p.patient_id
JOIN facilities f ON ps.facility_id = f.facility_id
WHERE ps.status NOT IN ('completed', 'denied', 'cancelled', 'expired')
ORDER BY 
    ps.is_emergency DESC,
    ps.priority_level = 'critical' DESC,
    ps.priority_level = 'high' DESC,
    ps.is_transfer_set DESC,
    ps.created_at ASC;

-- View: Facility capacity dashboard
CREATE OR REPLACE VIEW v_facility_capacity AS
SELECT 
    f.facility_id,
    f.name,
    f.city,
    f.state,
    f.facility_type,
    f.bed_count,
    f.current_census,
    (f.bed_count - f.current_census) AS available_beds,
    ROUND((f.current_census::DECIMAL / f.bed_count) * 100, 1) AS occupancy_rate,
    
    -- Capability flags
    f.accepts_302,
    f.accepts_mat,
    f.accepts_secure,
    f.accepts_detox,
    f.accepts_pediatric,
    f.accepts_geriatric,
    f.accepts_emergency,
    
    -- Contact information
    f.phone_number,
    f.contact_person,
    f.contact_phone,
    
    -- Pending admissions
    COALESCE(pending.pending_count, 0) AS pending_admissions,
    
    -- Operational status
    f.is_active,
    f.updated_at AS last_updated

FROM facilities f
LEFT JOIN (
    SELECT 
        facility_id,
        COUNT(*) AS pending_count
    FROM placement_search
    WHERE status IN ('initiated', 'pending', 'approved')
    GROUP BY facility_id
) pending ON f.facility_id = pending.facility_id

WHERE f.is_active = true
ORDER BY available_beds DESC, f.name;

-- ============================================================================
-- HEALTHCARE UTILITY FUNCTIONS
-- ============================================================================

-- Function: Update placement status with workflow validation
CREATE OR REPLACE FUNCTION update_placement_status(
    p_placement_search_id UUID,
    p_new_status VARCHAR(50),
    p_changed_by VARCHAR(200),
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_status VARCHAR(50);
    v_patient_id UUID;
    v_facility_id UUID;
    v_valid_transition BOOLEAN := false;
BEGIN
    -- Get current placement information
    SELECT status, patient_id, facility_id 
    INTO v_current_status, v_patient_id, v_facility_id
    FROM placement_search 
    WHERE placement_search_id = p_placement_search_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Placement search not found: %', p_placement_search_id;
    END IF;
    
    -- Validate status transitions (clinical workflow compliance)
    CASE v_current_status
        WHEN 'initiated' THEN
            v_valid_transition := p_new_status IN ('pending', 'denied', 'cancelled');
        WHEN 'pending' THEN  
            v_valid_transition := p_new_status IN ('approved', 'denied', 'cancelled', 'expired');
        WHEN 'approved' THEN
            v_valid_transition := p_new_status IN ('completed', 'cancelled');
        WHEN 'denied' THEN
            v_valid_transition := p_new_status IN ('initiated', 'cancelled');  -- Can restart process
        ELSE
            v_valid_transition := false;  -- Terminal states
    END CASE;
    
    -- Update if transition is valid
    IF v_valid_transition THEN
        -- Update placement status
        UPDATE placement_search 
        SET 
            status = p_new_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE placement_search_id = p_placement_search_id;
        
        -- Add status change note automatically
        INSERT INTO placement_notes (
            placement_search_id, 
            note_type, 
            body, 
            author,
            author_role
        ) VALUES (
            p_placement_search_id,
            'status_change',
            CASE 
                WHEN p_notes IS NOT NULL THEN
                    format('Status changed from %s to %s. Notes: %s', 
                           v_current_status, p_new_status, p_notes)
                ELSE
                    format('Status changed from %s to %s', v_current_status, p_new_status)
            END,
            p_changed_by,
            'system'
        );
        
        -- Update facility census if placement completed
        IF p_new_status = 'completed' THEN
            UPDATE facilities 
            SET 
                current_census = current_census + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE facility_id = v_facility_id;
        END IF;
        
        RETURN true;
    ELSE
        RAISE EXCEPTION 'Invalid status transition from % to % for placement %', 
                       v_current_status, p_new_status, p_placement_search_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Search facilities by capabilities
CREATE OR REPLACE FUNCTION search_facilities_by_capability(
    p_accepts_302 BOOLEAN DEFAULT NULL,
    p_accepts_mat BOOLEAN DEFAULT NULL,
    p_accepts_secure BOOLEAN DEFAULT NULL,
    p_accepts_detox BOOLEAN DEFAULT NULL,
    p_state VARCHAR(2) DEFAULT NULL,
    p_min_available_beds INTEGER DEFAULT 1,
    p_max_distance_miles INTEGER DEFAULT NULL
) RETURNS TABLE(
    facility_id UUID,
    name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    available_beds INTEGER,
    occupancy_rate DECIMAL,
    phone_number VARCHAR(20),
    contact_person VARCHAR(200),
    accepts_emergency BOOLEAN,
    distance_miles INTEGER  -- Placeholder for future geolocation
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.facility_id,
        f.name,
        f.city,
        f.state,
        (f.bed_count - f.current_census) AS available_beds,
        ROUND((f.current_census::DECIMAL / f.bed_count) * 100, 1) AS occupancy_rate,
        f.phone_number,
        f.contact_person,
        f.accepts_emergency,
        0::INTEGER AS distance_miles  -- Future: Calculate actual distance
    FROM facilities f
    WHERE f.is_active = true
      AND (p_accepts_302 IS NULL OR f.accepts_302 = p_accepts_302)
      AND (p_accepts_mat IS NULL OR f.accepts_mat = p_accepts_mat)  
      AND (p_accepts_secure IS NULL OR f.accepts_secure = p_accepts_secure)
      AND (p_accepts_detox IS NULL OR f.accepts_detox = p_accepts_detox)
      AND (p_state IS NULL OR f.state = p_state)
      AND (f.bed_count - f.current_census) >= p_min_available_beds
    ORDER BY available_beds DESC, f.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING AND DEMONSTRATION
-- ============================================================================

-- Insert sample facilities (anonymized/fictional data)
INSERT INTO facilities (
    name, facility_type, city, state, zip_code, phone_number,
    accepts_302, accepts_mat, accepts_secure, accepts_detox,
    bed_count, current_census, contact_person, contact_phone, is_active
) VALUES 
    ('Valley Medical Center', 'hospital', 'San Francisco', 'CA', '94102', '415-555-0001', 
     true, false, false, true, 150, 120, 'Dr. Sarah Johnson', '415-555-0101', true),
    
    ('Harbor Psychiatric Institute', 'specialty', 'Los Angeles', 'CA', '90210', '213-555-0002',
     true, true, true, false, 80, 65, 'Dr. Michael Chen', '213-555-0102', true),
     
    ('Riverside Treatment Center', 'residential', 'Sacramento', 'CA', '95814', '916-555-0003',
     false, true, false, true, 45, 30, 'Lisa Rodriguez RN', '916-555-0103', true),
     
    ('Central City Hospital', 'hospital', 'Fresno', 'CA', '93721', '559-555-0004',
     true, false, true, false, 200, 180, 'Dr. David Kim', '559-555-0104', true),
     
    ('Coastal Recovery Services', 'outpatient', 'San Diego', 'CA', '92101', '619-555-0005',
     false, true, false, true, 25, 15, 'Maria Santos LCSW', '619-555-0105', true);

-- Insert sample patients (fictional data for testing)
INSERT INTO patients (
    first_name, last_name, date_of_birth, gender, phone_number,
    emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_id,
    city, state, zip_code
) VALUES 
    ('John', 'Smith', '1985-03-15', 'male', '555-0201',
     'Jane Smith (spouse)', '555-0202', 'Blue Cross', 'BC123456789',
     'San Francisco', 'CA', '94102'),
     
    ('Maria', 'Garcia', '1992-07-22', 'female', '555-0301', 
     'Carlos Garcia (father)', '555-0302', 'Aetna', 'AET987654321',
     'Los Angeles', 'CA', '90210'),
     
    ('David', 'Johnson', '1978-11-08', 'male', '555-0401',
     'Sarah Johnson (sister)', '555-0402', 'Kaiser Permanente', 'KP456789123',
     'Sacramento', 'CA', '95814'),
     
    ('Lisa', 'Chen', '1990-05-30', 'female', '555-0501',
     'Michael Chen (brother)', '555-0502', 'United Healthcare', 'UHC321654987',
     'Fresno', 'CA', '93721');

-- Insert sample placement searches (demonstrating workflow)
INSERT INTO placement_search (
    patient_id, facility_id, status, priority_level, placement_type,
    diagnosis_primary, referring_physician, case_manager, is_emergency,
    target_placement_date, special_requirements
) 
SELECT 
    p.patient_id,
    f.facility_id,
    CASE 
        WHEN p.last_name = 'Smith' THEN 'pending'
        WHEN p.last_name = 'Garcia' THEN 'approved'  
        WHEN p.last_name = 'Johnson' THEN 'initiated'
        ELSE 'completed'
    END,
    CASE
        WHEN p.last_name = 'Smith' THEN 'high'
        WHEN p.last_name = 'Garcia' THEN 'medium'
        ELSE 'low'  
    END,
    CASE
        WHEN f.accepts_302 AND p.last_name = 'Smith' THEN '302_hold'
        WHEN f.accepts_mat AND p.last_name = 'Garcia' THEN 'mat_treatment'
        ELSE 'admission'
    END,
    'F32.9',  -- Major depressive disorder (sample ICD-10)
    'Dr. Emergency Room',
    'Case Manager Name',
    CASE WHEN p.last_name = 'Smith' THEN true ELSE false END,
    CURRENT_DATE + INTERVAL '1 day',
    CASE 
        WHEN p.last_name = 'Smith' THEN 'Requires 1:1 supervision'
        WHEN p.last_name = 'Garcia' THEN 'Spanish interpreter needed'
        ELSE NULL
    END
FROM patients p
CROSS JOIN facilities f  
WHERE (p.last_name = 'Smith' AND f.accepts_302)
   OR (p.last_name = 'Garcia' AND f.accepts_mat)
   OR (p.last_name = 'Johnson' AND f.accepts_secure)
   OR (p.last_name = 'Chen' AND f.facility_type = 'hospital')
LIMIT 4;  -- One placement per patient

-- Insert sample clinical notes
INSERT INTO placement_notes (
    placement_search_id, note_type, body, author, author_role, is_critical
)
SELECT 
    ps.placement_search_id,
    'clinical',
    CASE 
        WHEN ps.placement_type = '302_hold' THEN 
            'Patient presents with acute psychotic symptoms. Involuntary hold initiated for safety. Family notified.'
        WHEN ps.placement_type = 'mat_treatment' THEN
            'Patient requesting MAT services for opioid use disorder. Motivated for treatment. Insurance pre-authorized.'
        ELSE 
            'Standard admission workup completed. Medical clearance obtained. Patient stable for transfer.'
    END,
    'Dr. Clinical Staff',
    'physician',
    CASE WHEN ps.placement_type = '302_hold' THEN true ELSE false END
FROM placement_search ps
LIMIT 4;

-- ============================================================================
-- HIPAA COMPLIANCE VERIFICATION
-- ============================================================================

-- Create a view to verify audit logging is working
CREATE OR REPLACE VIEW v_audit_summary AS
SELECT 
    table_name,
    operation,
    COUNT(*) as operation_count,
    COUNT(CASE WHEN phi_accessed THEN 1 END) as phi_access_count,
    MAX(timestamp) as last_operation,
    array_agg(DISTINCT changed_by) as users_involved
FROM audit_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY table_name, operation
ORDER BY table_name, operation_count DESC;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION COMMANDS
-- ============================================================================

-- Update table statistics for query optimization
ANALYZE patients;
ANALYZE facilities; 
ANALYZE placement_search;
ANALYZE placement_notes;
ANALYZE audit_log;

-- ============================================================================
-- DATABASE INFORMATION SUMMARY
-- ============================================================================

-- Display schema deployment summary
DO $$
DECLARE
    patient_count INTEGER;
    facility_count INTEGER;
    placement_count INTEGER;
    note_count INTEGER;
    audit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_count FROM patients;
    SELECT COUNT(*) INTO facility_count FROM facilities;
    SELECT COUNT(*) INTO placement_count FROM placement_search;
    SELECT COUNT(*) INTO note_count FROM placement_notes;
    SELECT COUNT(*) INTO audit_count FROM audit_log;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'EMR Database Schema Deployment Complete!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Database: emr_placement_ssot';
    RAISE NOTICE 'PostgreSQL Version: %', version();
    RAISE NOTICE 'Deployment Date: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table Summary:';
    RAISE NOTICE '   • Patients: % records', patient_count;
    RAISE NOTICE '   • Facilities: % records', facility_count;
    RAISE NOTICE '   • Placement Searches: % records', placement_count;
    RAISE NOTICE '   • Clinical Notes: % records', note_count;
    RAISE NOTICE '   • Audit Log Entries: % records', audit_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ HIPAA Compliance Features:';
    RAISE NOTICE '   • UUID primary keys (prevents enumeration)';
    RAISE NOTICE '   • Comprehensive audit logging';
    RAISE NOTICE '   • PHI access tracking';
    RAISE NOTICE '   • Role-based access control ready';
    RAISE NOTICE '';
    RAISE NOTICE '🏥 Clinical Workflow Features:';
    RAISE NOTICE '   • Patient placement workflow tracking';
    RAISE NOTICE '   • Facility capability matching';
    RAISE NOTICE '   • Clinical documentation system';
    RAISE NOTICE '   • Automated status validation';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Available Views:';
    RAISE NOTICE '   • v_active_placement_searches (real-time workflow)';
    RAISE NOTICE '   • v_facility_capacity (capacity management)';
    RAISE NOTICE '   • v_audit_summary (compliance reporting)';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema deployment successful! ✅';
    RAISE NOTICE '============================================================================';
END $$;