# 🔧 ACTIVE PLACEMENT SEARCHES — COMPREHENSIVE PERSISTENCE & WORKFLOW SPECIFICATION

**Last updated:** September 29, 2025  
**Status:** ACTIVE DEVELOPMENT — Critical persistence issues identified  
**Priority:** P0 — System unusable without proper search persistence

This document provides the complete specification for Active Placement Searches functionality, including database persistence, level of care filtering, status-based coloring, and integration with commitment rules and SSOT additions. This replaces the previous incomplete implementation with a comprehensive solution.

---

## 🎯 EXECUTIVE SUMMARY

### Critical Issues Identified
- **PRIMARY ISSUE:** Active Placement Searches are not persisting to database — additions disappear on refresh
- **SECONDARY ISSUE:** Level of care filtering and status-based coloring not fully implemented
- **COMPLIANCE ISSUE:** Local storage PHI caching violates healthcare data requirements
- **SYNC ISSUE:** No concurrency protection or optimistic locking causing data loss

### Solution Overview
This specification defines a complete EMR-grade Active Placement Searches system with:
- Postgres-backed persistence with JSONB columns for search data
- Real-time status updates with color-coded visual indicators
- Level of care (LOC) matching and filtering based on patient ASAM levels
- Integration with commitment rules (201/302/303) from EMR_CommitmentRules_Kit_v2
- HIPAA-compliant data handling with encrypted fallback storage
- Comprehensive audit trails and search history tracking

---

## 🏥 ACTIVE PLACEMENT SEARCHES — FUNCTIONAL SPECIFICATION

### Core Requirements

**Primary Function:** Track and manage facility placement requests for patients requiring specific levels of care, with real-time status updates and database persistence.

**Key Features:**
- **Search Creation:** Add facilities to active search list from Facility Finder
- **Status Management:** Track search states (Searching, Pending, Accepted, Denied, No Beds)
- **LOC Filtering:** Filter facilities based on patient's ASAM level and commitment status  
- **Visual Indicators:** Color-coded status chips and priority highlighting
- **Persistence:** All searches persist to PostgreSQL with JSONB storage
- **History Tracking:** Complete audit trail of search events and status changes

### User Workflow

1. **Patient Selection:** Choose patient from patient list
2. **Facility Search:** Use Facility Finder to locate appropriate facilities
3. **Add to Searches:** Select facilities and add to Active Placement Searches
4. **Status Updates:** Update search status as facility responses come in
5. **Acceptance:** Record facility acceptance and coordinate transfer
6. **History Review:** View complete search timeline and audit trail

---

## 📊 TECHNICAL ARCHITECTURE

### Database Schema

**Primary Table: `patients`**
```sql
-- Core patient data with JSONB search storage
CREATE TABLE patients (
  patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  mrn TEXT,
  asam_level TEXT,  -- 3.1, 3.5, 3.7, 3.7WM, PSYCH_INPATIENT
  level_of_care TEXT,
  commitment_status TEXT, -- None, 201, 302, 303
  mat_needs JSONB DEFAULT '{}'::jsonb,
  searches JSONB DEFAULT '[]'::jsonb,
  search_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Search Object Structure:**
```javascript
{
  id: "uuid-v4",
  facilityId: "facility-uuid",
  facilityName: "Example Treatment Center",
  status: "Searching" | "Pending" | "Accepted" | "Denied" | "No Beds",
  channels: ["Phone", "Email", "Fax"],
  priority: "High" | "Normal" | "Low",
  createdAt: "2025-09-29T10:30:00Z",
  updatedAt: "2025-09-29T11:15:00Z",
  events: [
    {
      type: "status_change",
      timestamp: "2025-09-29T11:15:00Z",
      from: "Searching",
      to: "Pending", 
      notes: "Called facility, waiting for callback",
      userId: "user-uuid"
    }
  ]
}
```

### Level of Care (LOC) Integration

**LOC Mapping Rules:**
- **3.1 (Outpatient):** Outpatient treatment facilities
- **3.5 (Residential):** Residential treatment programs  
- **3.7 (Medically Monitored):** Medically supervised withdrawal management
- **3.7WM (Withdrawal Management):** Acute detoxification facilities
- **PSYCH_INPATIENT:** Psychiatric inpatient units

**Commitment Status Filtering:**
- **201 (Voluntary Psychiatric):** Only PSYCH_INPATIENT facilities
- **302/303 (Involuntary):** Only PSYCH_INPATIENT facilities, blocks SUD LOCs
- **None:** All appropriate LOC facilities available

### Visual Status System

**Status Colors & Icons:**
```javascript
const statusConfig = {
  Searching: {
    color: '#3B82F6',     // Blue
    bgColor: '#EFF6FF',   // Light blue
    icon: '🔍',
    label: 'Searching'
  },
  Pending: {
    color: '#F59E0B',     // Amber  
    bgColor: '#FFFBEB',   // Light amber
    icon: '⏳',
    label: 'Pending'
  },
  Accepted: {
    color: '#10B981',     // Green
    bgColor: '#ECFDF5',   // Light green
    icon: '✅', 
    label: 'Accepted'
  },
  Denied: {
    color: '#EF4444',     // Red
    bgColor: '#FEF2F2',   // Light red
    icon: '❌',
    label: 'Denied'
  },
  'No Beds': {
    color: '#6B7280',     // Gray
    bgColor: '#F9FAFB',   // Light gray  
    icon: '🏥',
    label: 'No Beds'
  }
};
```

---

## 🔧 CURRENT STATE ANALYSIS

### Critical Persistence Issues

**Issue #1: Search Data Not Persisting**
- **Problem:** Added searches disappear on page refresh
- **Root Cause:** `savePatientData()` calls not properly awaited
- **Impact:** Complete loss of search data, unusable system

**Issue #2: Database Schema Mismatch** 
- **Problem:** API expects columns not in current schema
- **Root Cause:** Missing JSONB columns and search-related fields
- **Impact:** Silent data loss, NULL values stored

**Issue #3: Local Storage PHI Violation**
- **Problem:** Patient data cached in browser localStorage
- **Root Cause:** Fallback persistence always enabled
- **Impact:** HIPAA compliance violation, data exposure risk

---

## 🛠️ IMPLEMENTATION SOLUTION

### Phase 1: Database Schema Fixes

**Required Migrations:**
```sql
-- Add missing JSONB columns for searches
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS searches JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}'::jsonb;

-- Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_patients_searches_gin ON patients USING GIN (searches);
CREATE INDEX IF NOT EXISTS idx_patients_search_history_gin ON patients USING GIN (search_history);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Phase 2: API Persistence Fixes  

**Update `production/api/persistence.js`:**
```javascript
async function savePatient(patientData) {
  const query = `
    UPDATE patients 
    SET 
      first_name = $2,
      last_name = $3, 
      date_of_birth = $4,
      mrn = $5,
      asam_level = $6,
      level_of_care = $7,
      commitment_status = $8,
      mat_needs = $9,
      searches = $10,
      search_history = $11
    WHERE patient_id = $1
    RETURNING *;
  `;
  
  const values = [
    patientData.id,
    patientData.firstName,
    patientData.lastName,
    patientData.dateOfBirth,
    patientData.mrn,
    patientData.asamLevel,
    patientData.levelOfCare, 
    patientData.commitmentStatus,
    JSON.stringify(patientData.matNeeds || {}),
    JSON.stringify(patientData.searches || []),
    JSON.stringify(patientData.searchHistory || [])
  ];
  
  const result = await this.pool.query(query, values);
  return result.rows[0];
}
```

### Phase 3: Frontend Search Management

**Enhanced Search Creation in `app.js`:**
```javascript
async function handleSearchPublish() {
  const selectedFacilityIds = getSelectedFacilityIds();
  const patient = getCurrentPatient();
  
  if (!selectedFacilityIds.length || !patient) return;
  
  let addedCount = 0;
  const timestamp = new Date().toISOString();
  
  selectedFacilityIds.forEach(facilityId => {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) return;
    
    // Create new search with UUID
    const newSearch = {
      id: crypto.randomUUID(),
      facilityId: facility.id,
      facilityName: facility.name,
      status: 'Searching',
      channels: getSelectedChannels(),
      priority: 'Normal',
      createdAt: timestamp,
      updatedAt: timestamp,
      events: [{
        type: 'search_created',
        timestamp: timestamp,
        notes: 'Search initiated from facility directory',
        userId: getCurrentUserId()
      }]
    };
    
    // Add to patient searches
    patient.searches = patient.searches || [];
    patient.searches.push(newSearch);
    
    // Add to search history
    patient.searchHistory = patient.searchHistory || [];
    patient.searchHistory.unshift({
      timestamp: timestamp,
      action: 'search_created',
      facilityName: facility.name,
      status: 'Searching',
      userId: getCurrentUserId()
    });
    
    addedCount++;
  });
  
  if (addedCount > 0) {
    try {
      // CRITICAL: Await the save operation
      await savePatientData(patient);
      showToast(`✅ Added ${addedCount} search${addedCount === 1 ? '' : 'es'} to active list`);
      renderActiveSearches(patient);
      closeSearchPopover();
    } catch (error) {
      console.error('Failed to persist search data:', error);
      showToast('❌ Failed to save searches - please try again');
      // Revert the changes
      patient.searches = patient.searches.slice(0, -addedCount);
      patient.searchHistory = patient.searchHistory.slice(addedCount);
    }
  }
}
```

### Phase 4: Status Update System

**Search Status Management:**
```javascript
async function updateSearchStatus(searchId, newStatus, notes = '') {
  const patient = getCurrentPatient();
  if (!patient || !patient.searches) return;
  
  const search = patient.searches.find(s => s.id === searchId);
  if (!search) return;
  
  const timestamp = new Date().toISOString();
  const oldStatus = search.status;
  
  // Update search object
  search.status = newStatus;
  search.updatedAt = timestamp;
  
  // Add status change event
  search.events = search.events || [];
  search.events.push({
    type: 'status_change',
    timestamp: timestamp,
    from: oldStatus,
    to: newStatus,
    notes: notes,
    userId: getCurrentUserId()
  });
  
  // Add to search history
  patient.searchHistory.unshift({
    timestamp: timestamp,
    action: 'status_change', 
    facilityName: search.facilityName,
    status: newStatus,
    notes: notes,
    userId: getCurrentUserId()
  });
  
  try {
    await savePatientData(patient);
    renderActiveSearches(patient);
    showToast(`✅ Updated ${search.facilityName} status to ${newStatus}`);
    
    // Special handling for acceptance
    if (newStatus === 'Accepted') {
      showAcceptanceDialog(search);
    }
  } catch (error) {
    console.error('Failed to update search status:', error);
    showToast('❌ Failed to update search status');
    // Revert changes
    search.status = oldStatus;
    search.updatedAt = search.events[search.events.length - 2]?.timestamp || search.createdAt;
    search.events.pop();
    patient.searchHistory.shift();
  }
}
```

### Phase 5: Level of Care Filtering

**LOC-Based Facility Filtering:**
```javascript
function getFilteredFacilitiesForPatient(patient, facilities) {
  const asamLevel = patient.note?.asam || patient.asamLevel;
  const commitmentStatus = patient.note?.commitment || patient.commitmentStatus;
  const matNeeds = patient.note?.matNeeds || patient.matNeeds;
  
  return facilities.filter(facility => {
    // Apply commitment rules from EMR_CommitmentRules_Kit_v2
    if (commitmentStatus === '201') {
      // 201 only allows PSYCH_INPATIENT
      return facility.type === 'PSYCH_INPATIENT';
    }
    
    if (commitmentStatus === '302' || commitmentStatus === '303') {
      // 302/303 only allows PSYCH_INPATIENT, blocks SUD LOCs
      return facility.type === 'PSYCH_INPATIENT';
    }
    
    // Map ASAM levels to facility types
    const locMapping = {
      '3.1': ['OUTPATIENT'],
      '3.5': ['RESIDENTIAL'], 
      '3.7': ['MEDICALLY_MONITORED'],
      '3.7WM': ['WITHDRAWAL_MANAGEMENT'],
      'PSYCH_INPATIENT': ['PSYCH_INPATIENT']
    };
    
    const allowedTypes = locMapping[asamLevel] || [];
    if (!allowedTypes.includes(facility.type)) return false;
    
    // Check MAT compatibility
    if (matNeeds && typeof matNeeds === 'object' && matNeeds.type) {
      if (matNeeds.type.includes('Methadone') && !facility.accepts_mat) {
        return false;
      }
    }
    
    return true;
  });
}
```

### 2.3 Frontend persistence (`development/prototypes/ui_prototype/src/app.js`)
- `mapPatientForPersistence` infers names by splitting `identifiers.name`, leading to blanks if the label changes format.
- `levelOfCare` uses `patient.board.placement` (facility name) instead of a clinical LOC value.
- `loadPatientSearches` replaces local `patient.searches` with `[]` when fetch fails, nuking unsynced edits.
- `savePatientData` is invoked without `await`; UI always shows success even when the save fails.
- No rollback or “needs sync” indicator when persistence errors occur.
- Search IDs use `Date.now()`, risking collisions.

### 2.4 Client persistence helper (`src/persistence/simple-persistence.js`)
- Always saves to localStorage first, even on API success, contradicting the requirement that bed searches come solely from the database.
- `apiUrl` is hard-coded to `http://localhost:3001/api` rather than honoring `VITE_API_URL`.
- `syncPending` reruns `save` on each failure, potentially duplicating entries and thrashing.
- No encryption or feature flag to disable local caching for PHI-heavy domains.

---

## 🎨 VISUAL DESIGN SYSTEM  

### Search Card Layout

**Active Search Card Structure:**
```html
<div class="search-card" data-search-id="${search.id}" data-status="${search.status}">
  <div class="search-header">
    <div class="facility-name">${search.facilityName}</div>
    <div class="status-chip status-${search.status.toLowerCase()}">
      <span class="status-icon">${statusConfig[search.status].icon}</span>
      <span class="status-label">${search.status}</span>
    </div>
  </div>
  <div class="search-meta">
    <div class="channels">${search.channels.join(', ')}</div>
    <div class="timestamp">${formatTimestamp(search.updatedAt)}</div>
  </div>
  <div class="search-actions">
    <button class="status-btn" onclick="updateSearchStatus('${search.id}', 'Pending')">
      Mark Pending
    </button>
    <button class="status-btn" onclick="updateSearchStatus('${search.id}', 'Accepted')">
      Record Acceptance  
    </button>
  </div>
</div>
```

**CSS Status Styling:**
```css
.status-searching {
  background-color: #EFF6FF;
  color: #3B82F6;
  border: 1px solid #DBEAFE;
}

.status-pending {
  background-color: #FFFBEB;
  color: #F59E0B;
  border: 1px solid #FED7AA;
}

.status-accepted {
  background-color: #ECFDF5;
  color: #10B981;
  border: 1px solid #A7F3D0;
}

.status-denied {
  background-color: #FEF2F2;  
  color: #EF4444;
  border: 1px solid #FECACA;
}

.status-no-beds {
  background-color: #F9FAFB;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}
```

### Priority Indicators

**High Priority Searches:**
- Red left border on search card
- "🔥 HIGH PRIORITY" badge
- Move to top of search list
- Highlighted in facility finder

---

## 🧪 TESTING STRATEGY

### Unit Tests

**Database Persistence Tests:**
```javascript
describe('Search Persistence', () => {
  test('should save new searches to database', async () => {
    const patient = createTestPatient();
    const search = createTestSearch();
    
    patient.searches.push(search);
    await savePatientData(patient);
    
    const savedPatient = await loadPatientData(patient.id);
    expect(savedPatient.searches).toContain(search);
  });
  
  test('should preserve search history on status update', async () => {
    const search = createTestSearch();
    await updateSearchStatus(search.id, 'Accepted', 'Facility confirmed bed');
    
    const updatedSearch = await getSearch(search.id);
    expect(updatedSearch.events).toHaveLength(2); // created + status_change
    expect(updatedSearch.status).toBe('Accepted');
  });
});
```

### Integration Tests

**E2E Search Flow:**
```javascript
test('complete search workflow', async ({ page }) => {
  // Navigate to patient
  await page.goto('/patients/test-patient-id');
  
  // Add search from facility finder
  await page.click('[data-testid="facility-finder-tab"]');
  await page.click('[data-testid="facility-123"] .add-to-search');
  await page.click('[data-testid="publish-searches"]');
  
  // Verify search appears in active list
  await expect(page.locator('[data-testid="active-searches"] .search-card')).toBeVisible();
  
  // Update search status
  await page.click('.search-card .status-btn[data-status="pending"]');
  await expect(page.locator('.status-chip.status-pending')).toBeVisible();
  
  // Verify persistence across page refresh
  await page.reload();
  await expect(page.locator('.status-chip.status-pending')).toBeVisible();
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] **Database Migrations Applied**
  - [ ] JSONB columns added to patients table
  - [ ] Search indexes created
  - [ ] Update triggers configured

- [ ] **API Updates Deployed** 
  - [ ] Persistence layer updated for JSONB handling
  - [ ] Search endpoints properly returning data
  - [ ] Error handling for failed saves implemented

- [ ] **Frontend Changes**
  - [ ] Async save operations properly awaited
  - [ ] Error states and rollback logic implemented
  - [ ] Status update UI connected to persistence
  - [ ] LOC filtering logic integrated

### Post-Deployment Verification

- [ ] **Functionality Tests**
  - [ ] Add new search from facility finder
  - [ ] Verify search persists after page refresh
  - [ ] Update search status and verify persistence
  - [ ] Test search filtering by LOC and commitment status

- [ ] **Performance Tests**
  - [ ] Search list loads in <2 seconds
  - [ ] Status updates complete in <1 second  
  - [ ] No memory leaks in search management

- [ ] **Error Handling**
  - [ ] Network failures show appropriate error messages
  - [ ] Failed saves trigger retry mechanisms
  - [ ] Data integrity maintained during errors

---

## 📈 SUCCESS METRICS

### Primary KPIs

- **Search Persistence Rate:** 100% (no data loss on refresh)
- **Search Add Success Rate:** >99% (accounting for network issues) 
- **Status Update Latency:** <1 second average
- **User Error Rate:** <1% (failed interactions)

### Secondary Metrics

- **LOC Filter Accuracy:** 100% (correct facilities shown per patient)
- **Visual Status Accuracy:** 100% (colors match actual search status)
- **Audit Trail Completeness:** 100% (all actions logged)
- **PHI Compliance:** 0 localStorage violations in production

---

## 🔗 INTEGRATION REFERENCES

### EMR_CommitmentRules_Kit_v2_2025-09-29
- **201 Rules:** Only PSYCH_INPATIENT facilities for voluntary psychiatric commitments
- **302/303 Rules:** Blocks SUD LOC options, restricts to PSYCH_INPATIENT only
- **SUD Exception:** Substance use disorder placements do NOT require 201 commitment

### EMR_SSOT_Additions_2025-09-29  
- **Persistence Policy:** Local PHI cache disabled by default (CRC_ENABLE_LOCAL_CACHE=0)
- **Encryption:** WebCrypto AES-GCM for any approved local storage
- **RBAC:** Role-based access control for search modifications
- **Audit Logging:** Complete event trail for compliance

---

## ⚡ IMMEDIATE ACTION ITEMS

### Critical (Fix Today)
1. **Apply database migrations** - Add JSONB columns for searches
2. **Fix savePatientData calls** - Add proper async/await handling  
3. **Remove localStorage fallback** - Eliminate PHI compliance violation
4. **Test search persistence** - Verify data survives page refresh

### High Priority (This Week)
1. Implement status update UI with proper error handling
2. Add LOC filtering based on ASAM level and commitment status
3. Create visual status indicators with proper color coding
4. Deploy and test complete search workflow end-to-end

This specification provides the complete foundation for a production-ready Active Placement Searches system that meets EMR standards for data persistence, compliance, and user experience.

---

## 3. Target Architecture & Policies

1. **System of Record**: Postgres is the canonical store. Local caching is disabled for bed searches unless a feature flag explicitly enables encrypted fallback.
2. **Data Model**: Patients table holds demographics, consent, ASAM level, LOC, commitment status, MAT needs (JSONB), insurance, emergency contact, and searches/search_history arrays. Timestamps maintain original creation time.
3. **API Contract**:
   - Mutations require `Idempotency-Key` and `If-Match` headers.
   - Responses include `version`, `updatedAt`, and server-derived summaries.
   - LOC mapping is resolved server-side; the client requests `/api/loc/resolve?asam=3.7WM`.
4. **Client Behaviour**:
   - All saves are awaited; failures trigger inline error states and maintain pending badges until retries succeed.
   - Search cards show sync status breadcrumbs (Saved, Pending sync, Conflict).
   - IDs are UUIDv4.
5. **Observability**: Instrument metrics for save attempts, fallbacks, conflicts, and latency. Send warning-level logs when fallback persistence is engaged.
6. **Security & Compliance**: Local cache (if enabled) encrypts payloads; RBAC enforces save permissions; audit logs capture user, action, outcome.

---

## 4. Implementation Plan

### Phase 1 – Schema Alignment & API Foundations
1. Apply database migrations (Appendix A) to add missing columns, search_history JSONB, idempotency metadata, and timestamp triggers.
2. Update `production/api/persistence.js` to:
   - Stop stringifying JSONB fields.
   - Only set `created_at` on insert; maintain `updated_at` on update.
   - Persist `search_history` alongside `searches`.
   - Accept optional `version`/`updated_at` and enforce optimistic concurrency (throw 409 when stale).
3. Adjust `/api/patients/:id` and `/api/patients` handlers to:
   - Use consistent property names (`mrn` instead of `medical_record_number`).
   - Include server-derived search summaries (status, highlight text, lastUpdated).
   - Provide `version` and `etag` headers.
4. Introduce `/api/searches/:id/summary` (or `/api/patients/:id/searches`) to feed both list and detail panes from the same DTO.

### Phase 2 – Client Save Flow Revamp
1. Refactor `mapPatientForPersistence` to use canonical fields; require explicit `patient.demographics` object.
2. Replace all `savePatientData(patient)` calls with `await savePatientData(patient)` and wrap in `try/catch` to surface errors.
3. Add optimistic rollback utilities:
   ```javascript
   async function persistWithRollback(patient, mutator) {
     const snapshot = structuredClone(patient.searches);
     mutator();
     try {
       await savePatientData(patient);
       markSearchSyncState(patient, 'synced');
     } catch (error) {
       patient.searches = snapshot;
       markSearchSyncState(patient, 'error', error.message);
       throw error;
     }
   }
   ```
4. Show sync badges on search rows (Saved, Syncing, Needs attention).
5. Swap `Date.now()` IDs for `crypto.randomUUID()`.
6. Update `loadPatientSearches` to only overwrite local state when the API call succeeds.

### Phase 3 – Persistence Helper Hardening
1. In `simple-persistence.js`, derive `apiUrl` from `import.meta.env.VITE_API_URL` and fall back only when offline or when a `VITE_ALLOW_LOCAL_CACHE` flag is set.
2. Reorder saves: API first, local fallback second. Encrypt local payloads when caching is enabled.
3. Implement exponential backoff for `syncPending` and cap retries. Record last error per record.
4. Publish metrics via `console.info` hooks (or structured logs) whenever fallback is engaged.

### Phase 4 – Dataset & Mapping Updates
1. Extend every patient scenario with:
   ```javascript
   demographics: {
     firstName: 'Dana',
     lastName: 'Nguyen',
     dateOfBirth: '1990-04-14',
     mrn: '2025501'
   },
   insurance: {
     primary: 'CBH',
     plan: 'Medicaid'
   },
   contacts: {
     emergency: { name: 'Anna Nguyen', phone: '215-555-1234' }
   }
   ```
2. Ensure each search includes both `events` and a concise `history` array before persistence.
3. Add LOC hints to the fixture so the server can test `/api/loc/resolve` parity.

### Phase 5 – Observability & Policy
1. Emit metrics (Prometheus labels or log counters) for:
   - `persistence_save_total{resource, method}`
   - `persistence_conflict_total`
   - `persistence_fallback_total`
2. Implement structured logging with patient ID hash, user ID, and result.
3. Draft and publish policies:
   - **Data Residency**: Local cache off by default, encryption required when enabled.
   - **RBAC**: Define roles allowed to create/update searches.
   - **42 CFR Part 2 compliance**: Ensure logs and metrics redact patient identifiers.
4. Add alerting rules (PagerDuty/email) for elevated fallback usage or repeated conflicts.

### Phase 6 – Testing Enhancements
1. Add API contract tests (Jest or Playwright APIRequestContext) that:
   - Create a patient via PUT, fetch it, verify `searches` and `search_history` persisted.
   - Simulate concurrent update to trigger 409 when `If-Match` is stale.
2. Extend Playwright E2E to:
   - Create a search, hard refresh, confirm status persists from API summary endpoint.
   - Run parity check between list and drawer view using the new summary route.
   - Exercise offline mode by intercepting PUT `/api/patients/:id` and verifying UI shows pending badge.
3. Add chaos tests that drop the network mid-save and ensure rollback occurs.
4. Test idempotency by replaying the same payload with the same `Idempotency-Key` and confirming the API returns 200 without duplicating data.

---

## 5. Rollout Checklist

1. **Schema**
   - [ ] Apply Appendix A migrations to dev/staging.
   - [ ] Update Prisma/ORM models (if any) to include new columns.
2. **Backend Code**
   - [ ] Refactor `persistence.js` and `server.js` according to Phase 1.
   - [ ] Add new `/api/searches/:id/summary` route.
3. **Frontend Code**
   - [ ] Implement awaited save flows and rollback helper.
   - [ ] Add sync badges and conflict UX.
   - [ ] Update dataset mappings and search histories.
4. **Persistence Helper**
   - [ ] Switch to API-first flow and env-based config.
   - [ ] Gate local caching behind `VITE_ALLOW_LOCAL_CACHE`.
5. **Docs & Policies**
   - [ ] Update README/architecture docs with new persistence design.
   - [ ] Publish policy doc for RBAC and PHI handling.
6. **Testing**
   - [ ] Add API/unit tests for new behaviours.
   - [ ] Expand Playwright suite as described.
   - [ ] Run `npx playwright test` (all browsers) and capture results.
7. **Observability**
   - [ ] Configure metrics and alerts.
   - [ ] Verify logs redact PHI.

---

## 6. Acceptance Criteria

- All production saves are acknowledged only after the server responds 2xx with matching version/etag.
- Bed searches survive browser refresh with zero dependency on localStorage (unless feature flag explicitly enables encrypted cache).
- API rejects stale updates with 409 and clients surface conflict resolution UI.
- Search list and detail views render identical state sourced from the summary endpoint.
- Metrics show `persistence_fallback_total == 0` under normal conditions; alerts fire when the fallback path is used.
- Compliance policies are documented and approved by security/legal stakeholders.
- Playwright, accessibility, API contract, and chaos tests all pass in CI.

---

## Appendix A – Database Migration Sketches

```sql
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS admission_status TEXT,
  ADD COLUMN IF NOT EXISTS commitment_status TEXT,
  ADD COLUMN IF NOT EXISTS medical_acuity TEXT,
  ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS insurance_primary TEXT,
  ADD COLUMN IF NOT EXISTS insurance_secondary TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Preserve original created_at
CREATE OR REPLACE FUNCTION set_patient_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := COALESCE(NEW.created_at, NOW());
    NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  ELSE
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patient_timestamps ON patients;
CREATE TRIGGER trg_patient_timestamps
BEFORE INSERT OR UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION set_patient_timestamps();

-- Idempotency log table
CREATE TABLE IF NOT EXISTS request_idempotency (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  response_payload JSONB
);

-- Optional index to prevent multiple active placements
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_active_search
  ON patients ((searches ->> 'selectedSearchId'))
  WHERE searches->>'selectedSearchId' IS NOT NULL;
```

---

## Appendix B – API Contract Updates

### PUT `/api/patients/:id`

**Headers**
- `Idempotency-Key: <uuid>` (required)
- `If-Match: <etag/version>` (required)

**Payload (excerpt)**
```json
{
  "id": "pt_501",
  "version": 3,
  "demographics": {
    "firstName": "Dana",
    "lastName": "Nguyen",
    "dateOfBirth": "1990-04-14"
  },
  "mrn": "2025501",
  "admissionStatus": "Active",
  "asamLevel": "3.7WM",
  "levelOfCare": "3.7 WM",
  "commitmentStatus": "302 Hold",
  "matNeeds": { "primary": "MethadoneContinue" },
  "searches": [...],
  "searchHistory": [...]
}
```

**Responses**
- `200 OK` with body `{ success: true, data: {...}, version: 4 }` and `ETag: "W/\"patient-pt_501-v4\""`
- `409 Conflict` when `If-Match` mismatches `version`
- `412 Precondition Failed` when headers missing

---

## Appendix C – Frontend Checklist by File

- `src/app.js`
  - [ ] Await every call to `savePatientData`.
  - [ ] Introduce `persistWithRollback` helper.
  - [ ] Add sync badges via CSS classes (`data-sync-state`).
  - [ ] Use `crypto.randomUUID()` for new IDs.
  - [ ] Update mapping logic to use `patient.demographics`.
- `src/persistence/simple-persistence.js`
  - [ ] Use env-based API URL and guard local cache.
  - [ ] Encrypt local payloads when caching is enabled.
  - [ ] Implement retry/backoff for `syncPending`.
- `src/data/newPatientScenarios.js`
  - [ ] Add `demographics`, `insurance`, `contacts`, `consents`, and enriched `searchHistory` entries.
- `production/api/persistence.js`
  - [ ] Store `search_history` and handle JSONB properly.
  - [ ] Respect incoming `version` and enforce concurrency.
- `production/api/server.js`
  - [ ] Normalize field names, add summary route, and expose consistent DTOs.
- `development/testing/tests/*`
  - [ ] Expand tests as outlined in Section 6.

---

## Appendix D – Observability Snippets

```javascript
// Example logging helper (Node)
function logPersistenceEvent({ patientId, userId, method, outcome, durationMs }) {
  console.info(JSON.stringify({
    event: 'persistence.save',
    patientId,
    userId,
    method, // database | fallback
    outcome, // success | conflict | error
    durationMs,
    timestamp: new Date().toISOString()
  }));
}

// Prometheus counter (if using prom-client)
persistenceSaveCounter.labels(resource, method, outcome).inc();
```

---

## Appendix E – Rollback & Conflict UX Sketch

1. When a save fails, show a toast: "Could not save to SSOT. Your edits are still visible but unsynced. Retry?"
2. Highlight the affected search row with `data-sync-state="error"` (red badge).
3. Offer buttons: **Retry**, **Discard changes**, **Copy error**.
4. On conflict (409), fetch latest record, diff changes, and show a modal allowing merge or overwrite.

---

### Final Notes

- Treat this document as the living source of truth for persistence work. Update it as tasks are completed.
- Keep design/product stakeholders in the loop for UX changes (sync badges, conflict handling).
- Coordinate with security/compliance early to approve the local caching policy and logging strategy.
- After implementation, schedule a post-migration review to ensure the "database only" promise is demonstrably met.

