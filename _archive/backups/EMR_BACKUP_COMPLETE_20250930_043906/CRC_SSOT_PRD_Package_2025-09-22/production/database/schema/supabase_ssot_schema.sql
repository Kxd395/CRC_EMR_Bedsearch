-- Supabase schema for CRC SSOT placement dropdown + quick note workflows
-- Run inside the Supabase project SQL editor or via psql.

-- ==== Extensions ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ==== Enumerations =========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'placement_status') THEN
    CREATE TYPE placement_status AS ENUM (
      'draft',
      'sent',
      'waiting',
      'accepted',
      'denied',
      'no_beds',
      'transfer_set',
      'closed'
    );
  END IF;
END $$;

-- ==== Core reference tables ===============================================
CREATE TABLE IF NOT EXISTS patients (
  patient_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn             text UNIQUE,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  date_of_birth   date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facilities (
  facility_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  city            text,
  state           text,
  phone           text,
  accepts_302     boolean NOT NULL DEFAULT false,
  accepts_mat     boolean NOT NULL DEFAULT false,
  accepts_secure  boolean NOT NULL DEFAULT false,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ==== Placement Searches table ============================================
CREATE TABLE IF NOT EXISTS placement_search (
  placement_search_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          uuid NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  facility_id         uuid REFERENCES facilities(facility_id) ON DELETE SET NULL,
  facility_name       text,
  status              placement_status NOT NULL DEFAULT 'draft',
  is_accepting        boolean NOT NULL DEFAULT false,
  is_transfer_set     boolean NOT NULL DEFAULT false,
  is_open             boolean GENERATED ALWAYS AS (
    status IN ('sent','waiting','accepted','transfer_set')
  ) STORED,
  search_origin       text,
  notes_summary       text,
  created_by          uuid,
  last_updated_at     timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_placement_search_patient_status
  ON placement_search (patient_id, status);

CREATE INDEX IF NOT EXISTS idx_placement_search_facility
  ON placement_search (facility_id);

-- Only one transfer set per patient
CREATE UNIQUE INDEX IF NOT EXISTS idx_placement_search_transfer_unique
  ON placement_search (patient_id)
  WHERE is_transfer_set;

-- Trigger: maintain last_updated_at on change
CREATE OR REPLACE FUNCTION trg_touch_placement_search()
RETURNS trigger AS $$
BEGIN
  NEW.last_updated_at := now();
  IF NEW.facility_name IS NULL AND NEW.facility_id IS NOT NULL THEN
    SELECT f.name INTO NEW.facility_name FROM facilities f WHERE f.facility_id = NEW.facility_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placement_search_touch ON placement_search;
CREATE TRIGGER placement_search_touch
  BEFORE UPDATE ON placement_search
  FOR EACH ROW
  EXECUTE PROCEDURE trg_touch_placement_search();

-- ==== Placement Notes table ===============================================
CREATE TABLE IF NOT EXISTS placement_notes (
  note_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_search_id uuid NOT NULL REFERENCES placement_search(placement_search_id) ON DELETE CASCADE,
  author_id           uuid NOT NULL,
  body                text NOT NULL,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_placement_notes_psid_created
  ON placement_notes (placement_search_id, created_at DESC);

-- ==== Helper view for dropdown ============================================
CREATE OR REPLACE VIEW v_active_placement_searches AS
SELECT
  ps.placement_search_id,
  ps.patient_id,
  ps.facility_id,
  COALESCE(ps.facility_name, f.name) AS facility_name,
  ps.status,
  ps.is_accepting,
  ps.is_transfer_set,
  ps.last_updated_at
FROM placement_search ps
LEFT JOIN facilities f ON f.facility_id = ps.facility_id
WHERE ps.is_open
ORDER BY
  ps.patient_id,
  ps.is_transfer_set DESC,
  ps.is_accepting DESC,
  ps.last_updated_at DESC;

-- ==== Utility function: enforce single transfer set =======================
CREATE OR REPLACE FUNCTION set_transfer_set(p_patient_id uuid, p_search_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE placement_search
    SET is_transfer_set = false
    WHERE patient_id = p_patient_id AND is_transfer_set;

  UPDATE placement_search
    SET is_transfer_set = true,
        status = 'transfer_set'
    WHERE placement_search_id = p_search_id;
END;
$$ LANGUAGE plpgsql;

-- ==== Supabase Row Level Security (optional defaults) =====================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_search ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Example policies (tune to your auth model)
DROP POLICY IF EXISTS "Patients can view their records" ON patients;
CREATE POLICY "Patients can view their records" ON patients
  FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Staff read placement searches" ON placement_search;
CREATE POLICY "Staff read placement searches" ON placement_search
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff update placement searches" ON placement_search;
CREATE POLICY "Staff update placement searches" ON placement_search
  FOR UPDATE USING (auth.role() IN ('service_role','authenticated'));

DROP POLICY IF EXISTS "Staff insert placement searches" ON placement_search;
CREATE POLICY "Staff insert placement searches" ON placement_search
  FOR INSERT WITH CHECK (auth.role() IN ('service_role','authenticated'));

DROP POLICY IF EXISTS "Staff manage placement notes" ON placement_notes;
CREATE POLICY "Staff manage placement notes" ON placement_notes
  USING (auth.role() IN ('service_role','authenticated'))
  WITH CHECK (auth.role() IN ('service_role','authenticated'));

-- ==== Seed helpers (optional) =============================================
-- Uncomment and adjust to seed initial facilities/patients for testing.
-- INSERT INTO facilities (facility_id, name, city, state, accepts_302, accepts_mat, accepts_secure)
-- VALUES
--   ('11111111-1111-1111-1111-111111111111', 'Abington Hospital - Jefferson', 'Abington', 'PA', true, true, true),
--   ('22222222-2222-2222-2222-222222222222', 'Sunrise Treatment Center', 'Philadelphia', 'PA', false, true, false);

-- INSERT INTO patients (patient_id, mrn, first_name, last_name, date_of_birth)
-- VALUES
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MRN123', 'Jordan', 'Lee', '1990-01-15');

-- INSERT INTO placement_search (placement_search_id, patient_id, facility_id, status, is_accepting)
-- VALUES
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'waiting', false),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'accepted', true);

-- INSERT INTO placement_notes (placement_search_id, author_id, body)
-- VALUES
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', 'Accepted phone confirmation + quick note.');

-- End of schema
