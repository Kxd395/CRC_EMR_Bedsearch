-- Migration script to add missing JSONB columns to remote database
-- Run this on your remote PostgreSQL server: 100.112.67.23

-- Add missing columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS searches JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS admission_status TEXT,
ADD COLUMN IF NOT EXISTS medical_acuity TEXT,
ADD COLUMN IF NOT EXISTS insurance_primary TEXT,
ADD COLUMN IF NOT EXISTS insurance_secondary TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ DEFAULT now();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_searches_gin ON patients USING GIN (searches);
CREATE INDEX IF NOT EXISTS idx_patients_search_history_gin ON patients USING GIN (search_history);
CREATE INDEX IF NOT EXISTS idx_patients_mat_needs_gin ON patients USING GIN (mat_needs);

-- Update existing patients to have empty arrays/objects where NULL
UPDATE patients 
SET 
  searches = COALESCE(searches, '[]'::jsonb),
  search_history = COALESCE(search_history, '[]'::jsonb),
  mat_needs = COALESCE(mat_needs, '{}'::jsonb)
WHERE 
  searches IS NULL OR 
  search_history IS NULL OR 
  mat_needs IS NULL;

-- Add trigger for updated_at if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Show current schema to verify
\d patients;