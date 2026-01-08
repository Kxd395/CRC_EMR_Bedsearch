# Bed Search Persistence SSOT

Last updated: 2025-09-30

This single source of truth (SSOT) maps every function, data shape, and breadcrumb that participates in bed search persistence. Use it to audit current logic, identify gaps, and trace defects across the stack.

---

## 1. System Overview

| Layer | Primary Components | Role |
| --- | --- | --- |
| Data Seeds | `development/prototypes/ui_prototype/src/data/newPatientScenarios.js` | Provides initial patient + search fixtures loaded at runtime. |
| UI State/Controllers | `development/prototypes/ui_prototype/src/app.js` | Manages patient selection, search creation, updates, and calls to persistence helpers. |
| Client Persistence Helper | `development/prototypes/ui_prototype/src/persistence/simple-persistence.js` | Wraps API calls and (currently) writes localStorage fallbacks. |
| API Layer | `production/api/server.js`, `production/api/persistence.js` | REST endpoints (`/api/patients`, `/api/placements`, etc.) and database access. |
| Database | PostgreSQL (`patients`, `placement_attempts`, etc.) | System of record; intended to store searches/search_history JSONB. |

Data flows left-to-right with optional fallback to localStorage (dotted line).

```
newPatientScenarios.js ─▶ app.js state │ UI events
                               │ savePatientData + mapPatientForPersistence
                               ▼
                    simple-persistence.js (optional)
                               │ fetch( /api/patients/:id )
                               ▼
                    server.js → persistence.js → PostgreSQL
                               └─(fallback)→ local JSON files
```

---

## 2. Data Mapping Matrix

### 2.1 Patient Payload Fields

| Field | Source (UI) | Mapper | API Field | DB Column | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | `patient.id` (fixtures) | `mapPatientForPersistence` | `id` | `patients.id` | Key for reads/writes. |
| `firstName` / `lastName` | Derived from `identifiers.name` split | `mapPatientForPersistence` | `firstName`, `lastName` | `patients.first_name`, `patients.last_name` | Fails when label format changes. Add explicit fields. |
| `mrn` | `identifiers.mrn` | `mapPatientForPersistence` | `mrn` | `patients.mrn` | API currently reads `medical_record_number`. |
| `dateOfBirth` | Missing in fixtures | `mapPatientForPersistence` | `dateOfBirth` | `patients.date_of_birth` | DB column unused by current code. |
| `admissionStatus` | `patient.admissionStatus` or `board.statusKey` | `mapPatientForPersistence` | `admissionStatus` | `patients.admission_status` | Null unless dataset contains value. |
| `asamLevel` | `patient.note?.asam` | `mapPatientForPersistence` | `asamLevel` | `patients.asam_level` | Drives LOC filtering. |
| `levelOfCare` | `patient.note?.levelOfCare` or `board.placement` | `mapPatientForPersistence` | `levelOfCare` | `patients.level_of_care` | Currently misused as facility name. |
| `commitmentStatus` | `patient.note?.commitment` | `mapPatientForPersistence` | `commitmentStatus` | `patients.commitment_status` | Maps 302/201 statuses. |
| `medicalAcuity` | `patient.note?.acuity` | `mapPatientForPersistence` | `medicalAcuity` | `patients.medical_acuity` | Column exists only in code. |
| `matNeeds` | `patient.note?.matNeeds` | `mapPatientForPersistence` | `matNeeds` (object) | `patients.mat_needs` (JSONB) | `persistence.js` stringifies; should store JSON. |
| `insurancePrimary/Secondary` | `patient.insurance?.primary` | `mapPatientForPersistence` | `insurancePrimary/Secondary` | `patients.insurance_primary/_secondary` | Fixtures lack insurance section. |
| `emergencyContactName/Phone` | `patient.contact?.emergency` | `mapPatientForPersistence` | `emergencyContactName/Phone` | `patients.emergency_contact_name/_phone` | Rarely populated. |
| `searches` | `patient.searches` | `mapPatientForPersistence` (pass-through) | `searches` | `patients.searches` (JSONB) | Each search should include `history` for reconstruction. |
| `searchHistory` | `patient.searchHistory` | `mapPatientForPersistence` | `searchHistory` | Not persisted (should map to `patients.search_history`) | API rebuilds from search events when missing. |
| `updatedAt` | `new Date().toISOString()` | `mapPatientForPersistence` | `updatedAt` | `patients.updated_at` | API overrides with NOW(). |

### 2.2 Search Object Shape

| Property | Populated By | Consumers |
| --- | --- | --- |
| `id` | `ensureFacilitySearch` (`facilityId-Date.now()`), dataset seeds | `app.js`, API (primary key inside JSON array) |
| `facilityId` | dataset or new search modal | Server summary, UI filters |
| `facilityName` | dataset or modal | UI + server summary |
| `status` | Quick Update (`applyQuickUpdate`), drawer (`persistDrawerChanges`), `addSearchEvent` | UI colors, server derived timeline |
| `status_reason_code/text` | Quick update/drawer | UI tooltips, audit |
| `summary` | Quick update/drawer | UI + API responses |
| `channels` | seeds or quick add | Display only |
| `history` | Quick update/drawer/appends | `/api/patients/:id` fallback reconstruction |
| `events` | `addSearchEvent` | LOC timeline + server history rebuild |
| `assignedTo` | dataset or drawer | UI |
| `updated` | Quick update/drawer/events | UI refresh + server fallback |

### 2.3 Persistence Helper Flags

| Flag | Definition | Where Set | Where Read |
| --- | --- | --- | --- |
| `saveData.synced` | True when API POST succeeds | `simple-persistence.js::save` | Used to color fallback badge | 
| `saveData.needsSync` | True when API fails | `simple-persistence.js::save` | `syncPending` queue | 
| LocalStorage key | `crc_${type}_${id}` | `saveLocal` | `loadAll`, `getStatus` |

---

## 3. Function Interconnections

### 3.1 Patient Selection & Loading
1. `populatePatientSelector()` (app.js) renders options from `newPatientScenarios`.
2. `handlePatientSwitch(event)` updates `state.currentPatientId` and awaits `loadPatientSearches(patient)`.
3. `loadPatientSearches(patient)` fetches `/api/patients/:id`; on success replaces `patient.searches` and `patient.searchHistory`. On failure, retains existing arrays.

### 3.2 Creating a Search
1. Quick update path → `ensureFacilitySearch(patient, facilityId)`
   - Checks for existing search by facilityId.
   - If new, builds minimal search object, pushes into `patient.searches`, calls `savePatientData(patient)`.
2. Facility finder publish → same helper used after selecting multiple cards.

### 3.3 Updating Status (Quick Update)
1. `handleSaveQuickUpdate()` resolves `reasonDef`, `noteText`, etc.
2. Calls `applyQuickUpdate({ patient, search, ... })`:
   - Normalises status.
   - Appends to `search.history` and `patient.searchHistory`.
   - Updates patient board/PA info when applicable.
3. Immediately invokes `savePatientData(patient)` (no await) to persist.

### 3.4 Drawer Edits
1. `persistDrawerChanges(publishToSsot)` updates selected search fields.
2. Pushes `search.history` entry.
3. Calls `savePatientData(patient)` (no await) and closes drawer.

### 3.5 Event Timeline
1. `addSearchEvent(search, eventType, payload)` appends to `search.events`, recalculates derived status and `search.updated`.
2. When events are triggered via transport scheduling or manual add, the caller subsequently invokes `savePatientData(patient)`.

### 3.6 Persistence Functions
1. `savePatientData(patient)` in `app.js` builds payload via `mapPatientForPersistence` and uses `fetch PUT /api/patients/:id`.
2. On success → toast "Patient data saved to database".
3. On failure → console error, toast failure, exception bubbled.
4. `simple-persistence.js::save` is a separate helper (used by assessments, not by bed searches after recent refactor) that still writes localStorage first.

### 3.7 API Pipeline
1. `/api/patients/:id` handler (server.js)
   - Fetches record via `persistence.getPatient`.
   - Normalises fields via `coalesce` helper.
   - Reconstructs `searchHistory` from `search.history` when `search_history` column empty.
2. `persistence.savePatient(patientData)`
   - Upserts patient row with JSON.stringify fields.
   - Saves fallback JSON file on success.
   - On error, writes fallback data with `persistenceMethod: 'fallback'`.

---

## 4. Breadcrumbs & Diagnostics

### 4.1 Current Breadcrumbs
- **UI Toasts**: Success and failure messages in `savePatientData` and `handleSaveQuickUpdate`.
- **Console Logs**: `console.log('✅ Patient data saved successfully')` (UI) and server logs on persistence.
- **Fallback Files**: JSON files under `production/api/data/fallback/{patients|assessments|placements}` containing `persistenceMethod`.
- **`CrcPersistence.showStatus()`**: Displays counts of localStorage items (if helper is loaded).

### 4.2 Missing Breadcrumbs
- No per-search sync badge or timestamp in UI.
- No audit log linking user ID to save outcome.
- No server metrics or status endpoint that surfaces fallback usage.
- No UI indicator for conflict (stale version) or retry state.

### 4.3 Suggested Instrumentation
- Add `data-sync-state` attribute to search rows (`synced`, `pending`, `error`).
- Emit structured logs with patient ID hash, user ID, method (`database` vs `fallback`).
- Expose `/api/persistence/status` summarising fallback queue and last sync.

---

## 5. Known Logic Issues (Quick Reference)

1. **Schema Drift**: `persistence.js` expects columns that migrations/documentation do not define. Fix by aligning schema (see Appendix A of the fix plan).
2. **Name Mapping Fragility**: Splitting `identifiers.name` breaks when labels change. Add explicit `demographics` data.
3. **LocalStorage Exposure**: `simple-persistence.js` writes unencrypted local data even when server save succeeds.
4. **Save Without Await**: Many UI save calls ignore rejected promises, leaving UI "green" despite failure.
5. **Search History Loss**: If `search.history` not populated before saving, API returns empty history.
6. **ID Collision Risk**: Using `Date.now()` for IDs across multiple users can collide.
7. **No Optimistic Concurrency**: Parallel edits overwrite each other; add version/ETag handling.

---

## 6. Verification Playbooks

### 6.1 Trace a Bed Search Update
1. **UI**: Trigger quick update (e.g., "Packet sent"), note timestamp.
2. **Network**: Inspect `PUT /api/patients/:id` payload; confirm search entry contains new status and history line.
3. **Server Log**: Check server output for `Patient updated via database` message; ensure no fallback warning.
4. **Database**: Query `SELECT searches FROM patients WHERE id = 'pt_501'` to verify JSON includes the update.
5. **Reload UI**: Refresh browser; confirm search row shows updated status/history.

### 6.2 Detect Local Fallback Usage
1. Disable network (or kill API).
2. Perform update; ensure UI surfaces failure and sets pending badge.
3. Inspect `localStorage` for `patient_<id>` key and fallback file under `production/api/data/fallback/patients/`.

### 6.3 Validate Search History
1. Clear `search.history` before save (simulate bug) and observe API response lacking history.
2. Fix by ensuring `applyQuickUpdate` writes history before save; repeat to confirm timeline persists.

---

## 7. File-by-File Review Checklist

| File | Key Items to Review |
| --- | --- |
| `src/app.js` | `mapPatientForPersistence`, `savePatientData`, quick update/drawer flows, search event handlers. Verify awaits, rollback logic, and ID generation. |
| `src/persistence/simple-persistence.js` | Order of operations, env config, encryption/feature flags, retry logic. |
| `src/data/newPatientScenarios.js` | Presence of demographics, insurance, contacts, search events/history. |
| `production/api/persistence.js` | Column mappings, JSON handling, concurrency enforcement, fallback cleanup. |
| `production/api/server.js` | DTO normalisation, search history derivation, summary endpoints. |
| `documentation/BED_SEARCH_PERSISTENCE_FIX.md` | Alignment of tasks with code; update after each implementation milestone. |
| `development/testing/tests/*` | Ensure tests assert API round-trips and sync states. |

---

## 8. Next Actions

1. Align database schema with code (see fix plan Appendix A).
2. Update dataset and mapping logic to include explicit demographics and search histories.
3. Introduce awaited save flows and sync indicators in the UI.
4. Harden persistence helper (API-first, encrypted optional cache).
5. Implement optimistic concurrency and idempotency in API routes.
6. Add metrics/logging for save outcomes and fallback paths.
7. Expand automated tests to cover API persistence, conflict handling, and offline/rollback behaviour.

Document owners: Platform Engineering + EMR Frontend team. Keep this SSOT synchronized with implementation.

