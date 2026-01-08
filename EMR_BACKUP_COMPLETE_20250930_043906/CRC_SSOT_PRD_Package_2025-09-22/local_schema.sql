-- EMR Local Database Schema with JSONB support for Active Placement Searches
-- This schema supports the complete persistence requirements

-- Create patients table with proper JSONB columns
CREATE TABLE IF NOT EXISTS patients (
  patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  mrn TEXT UNIQUE,
  asam_level TEXT,
  level_of_care TEXT,
  commitment_status TEXT,
  admission_status TEXT,
  medical_acuity TEXT,
  mat_needs JSONB DEFAULT '{}'::jsonb,
  insurance_primary TEXT,
  insurance_secondary TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  searches JSONB DEFAULT '[]'::jsonb,
  search_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  facility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  phone TEXT,
  facility_type TEXT, -- OUTPATIENT, RESIDENTIAL, MEDICALLY_MONITORED, WITHDRAWAL_MANAGEMENT, PSYCH_INPATIENT
  accepts_302 BOOLEAN DEFAULT false,
  accepts_mat BOOLEAN DEFAULT false,
  accepts_secure BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_searches_gin ON patients USING GIN (searches);
CREATE INDEX IF NOT EXISTS idx_patients_search_history_gin ON patients USING GIN (search_history);
CREATE INDEX IF NOT EXISTS idx_patients_mat_needs_gin ON patients USING GIN (mat_needs);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients (mrn);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities (facility_type);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at 
  BEFORE UPDATE ON facilities 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample test data
INSERT INTO patients (patient_id, first_name, last_name, mrn, asam_level, level_of_care, mat_needs) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Dana', 'Nguyen', 'MRN001', '3.7', 'Medically Monitored', '{"type": "MethadoneContinue", "status": "active"}'::jsonb),
('550e8400-e29b-41d4-a716-446655440002', 'Michael', 'Chen', 'MRN002', '3.5', 'Residential', '{}'::jsonb),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah', 'Johnson', 'MRN003', '3.1', 'Outpatient', '{}'::jsonb)
ON CONFLICT (mrn) DO NOTHING;

-- Insert sample facilities
INSERT INTO facilities (name, city, state, facility_type, accepts_mat) VALUES 
('Philadelphia Treatment Center', 'Philadelphia', 'PA', 'MEDICALLY_MONITORED', true),
('Center City Recovery', 'Philadelphia', 'PA', 'RESIDENTIAL', false),
('Outpatient Services Inc', 'Philadelphia', 'PA', 'OUTPATIENT', true)
ON CONFLICT DO NOTHING;