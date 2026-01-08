-- 2025-09-30: Bed search invariants
-- Only one selected facility per search
CREATE UNIQUE INDEX IF NOT EXISTS ux_one_selected_facility_per_search
ON bed_search_facility(search_id)
WHERE state = 'SELECTED_FOR_TRANSFER';

-- Optional: one active search per patient (tune list)
CREATE UNIQUE INDEX IF NOT EXISTS ux_one_active_search_per_patient
ON bed_search(patient_id)
WHERE current_status IN ('OPEN','SEARCHING','PENDING_TRANSFER');
