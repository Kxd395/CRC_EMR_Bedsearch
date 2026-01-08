-- 2025-09-30: Patients JSONB columns & timestamp guard
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS searches JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION set_updated_at_patients() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at_patients ON patients;
CREATE TRIGGER trg_updated_at_patients
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION set_updated_at_patients();
