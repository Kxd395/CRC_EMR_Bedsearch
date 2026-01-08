# 🏥 EMR CRC SSOT - UI Prototype Guide

**Last Updated**: September 29, 2025  
**Development Environment**: Vanilla ESM SPA with Vite

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:
- ✅ Component architecture changes
- ✅ E2E test selectors added/modified
- ✅ Commitment/placement rules updated
- ✅ Persistence patterns change
- ✅ Environment variables added/changed
- ✅ Documentation dashboard states updated

## 🎯 Quick Start

### Environment & Scripts

- **Node**: use `.nvmrc` (v20.x). Run `nvm use`
- **Env**: `VITE_API_URL` (required), `CRC_ENABLE_LOCAL_CACHE=0` (prod default)
- **Scripts**: `npm run dev`, `npm run build`, `npm run preview -- --host`, `npm run lint`
- **Pre-commit**: lint-staged + prettier (reject commits on lint errors)

```bash
# Setup
nvm use
npm install
cp .env.example .env
# Edit .env with your API URL

# Development
npm run dev

# Production preview
npm run preview -- --host

# Code quality
npm run lint
npm run format
```

## 🏗️ Architecture Overview

### One-File Brain Pattern

**Core Philosophy**: Single `app.js` orchestrates everything with helper modules for specific domains.

```
src/
├── app.js                 # Main orchestrator (keep under 800 lines)
├── main.js                # Entry point
├── commitmentPanel.js     # Commitment status management
├── facilityFinder.js      # Facility search & matching
├── status/
│   └── derive.js         # Pure status derivation functions
├── persistence/
│   ├── api.js            # API client with guards
│   └── local.js          # Local storage with encryption
├── docs/
│   └── dashboard.js      # Documentation state machine
├── components/
│   ├── common/           # Shared UI components
│   ├── forms/            # Form components with validation
│   └── tables/           # Data display components
├── config/
│   └── environment.js    # Environment configuration
└── styles/
    └── main.css          # Global styles
```

### Module Boundaries

**Size Control**: Keep each module under ~300 lines; export pure helpers that are unit-testable.

- `app.js`: Main coordinator, event handling, UI state
- `commitmentPanel.js`: Commitment status logic (already exists)
- `facilityFinder.js`: Facility search, filtering, matching
- `status/derive.js`: Pure functions for status computation
- `persistence/api.js`: HTTP client with error handling
- `docs/dashboard.js`: Documentation workflow state machine

## 🧪 E2E Testing Conventions

### Test Selectors & Scroll Guards

**Use data-testids consistently**:
- `patient-row-{id}`: Patient table rows
- `patient-row-{id}-status`: Status indicators  
- `facility-select`: Facility selection controls
- `select-for-transfer`: Transfer selection button
- `docs-row-{DOC_CODE}`: Documentation dashboard rows

**Mobile Scroll Rules**: All mobile flows call `.scrollIntoViewIfNeeded()` before `.click()`

```javascript
// Example E2E test pattern
await page.locator('[data-testid="patient-row-pt_501"]').scrollIntoViewIfNeeded();
await page.locator('[data-testid="patient-row-pt_501-status"]').click();
await page.locator('[data-testid="select-for-transfer"]').click();
```

### Test Stability

**Required for all interactions**:
```javascript
// Wait for element to be actionable
await element.waitFor({ state: 'visible' });
await element.scrollIntoViewIfNeeded();
await element.click();
```

## 🏥 Commitment & Placement Matrix (PA)

### Core Rules

**SUD placements never require a 201**. 201/302/303 are psychiatric commitment statuses only.

| Commitment Status | Allowed LOC | Additional Requirements |
|------------------|-------------|-------------------------|
| `SUD` (no commitment) | ASAM 3.1, 3.5, 3.7, 3.7WM | 42 CFR Part 2 consent before outbound contact |
| `201_VOLUNTARY` | PSYCH_INPATIENT only | Standard psychiatric admission |
| `302_INVOLUNTARY` | PSYCH_INPATIENT only | Filter facilities to `acceptsInvoluntary=true` |
| `303_EXTENDED` | PSYCH_INPATIENT only | Filter facilities to `acceptsInvoluntary=true` |

### Implementation

```javascript
// Commitment filtering logic
function filterFacilitiesByCommitment(facilities, commitmentStatus) {
  if (commitmentStatus === 'SUD') {
    // SUD placements: show ASAM levels, hide psychiatric
    return facilities.filter(f => 
      f.levelOfCare && f.levelOfCare.startsWith('ASAM')
    );
  }
  
  if (['201_VOLUNTARY', '302_INVOLUNTARY', '303_EXTENDED'].includes(commitmentStatus)) {
    // Psychiatric commitments: only psychiatric inpatient
    const psychFacilities = facilities.filter(f => 
      f.levelOfCare === 'PSYCH_INPATIENT'
    );
    
    // For involuntary commitments, require acceptsInvoluntary capability
    if (commitmentStatus.includes('INVOLUNTARY') || commitmentStatus === '303_EXTENDED') {
      return psychFacilities.filter(f => f.acceptsInvoluntary === true);
    }
    
    return psychFacilities;
  }
  
  return facilities; // No filtering for other statuses
}

// Usage in facility finder
const filteredFacilities = filterFacilitiesByCommitment(
  allFacilities, 
  patient.commitmentStatus
);
```

## 📊 Status & Events Invariants

### Core Rules (Never Violate)

1. **Never set `search.status` directly**; always go through `addSearchEvent()` and let `deriveSearchStatus()` compute status
2. **One facility max** as "Selected for Transfer" per search
3. **List and detail must show the server-derived summary** (once that endpoint is wired); the UI should not compute status differently in two places

### Status Derivation

```javascript
// Pure function for status computation
function deriveSearchStatus(search) {
  const events = search.events || [];
  const latestEvent = events[events.length - 1];
  
  if (!latestEvent) return 'PENDING';
  
  switch (latestEvent.type) {
    case 'FACILITY_SELECTED':
      return 'SELECTED_FOR_TRANSFER';
    case 'PLACEMENT_CONFIRMED':
      return 'CONFIRMED';
    case 'PLACEMENT_CANCELLED':
      return 'CANCELLED';
    default:
      return 'ACTIVE';
  }
}

// Event-driven status updates
function addSearchEvent(search, eventType, eventData) {
  const event = {
    id: generateId(),
    type: eventType,
    timestamp: new Date().toISOString(),
    data: eventData
  };
  
  search.events = [...(search.events || []), event];
  search.status = deriveSearchStatus(search); // Always derive, never set directly
  
  return search;
}
```

### Self-Check Invariant

Add this to your development console for validation:

```javascript
// Invariant: Only one facility can be selected for transfer per search
console.assert(
  new Set(
    patient.searches
      .map(s => s.status === 'SELECTED_FOR_TRANSFER' ? s.facilityId : null)
      .filter(Boolean)
  ).size <= 1,
  'Invariant failed: multiple Selected-for-Transfer facilities'
);
```

## 📋 Documentation Dashboard States

### State Machine

Each required doc row follows this state machine:
**`MISSING → PENDING → RECEIVED|SIGNED`** (with optional `REJECTED` state)

| State | Description | UI Display | Actions Available |
|-------|-------------|------------|------------------|
| `MISSING` | Document not yet requested | 🔴 Red indicator | Upload, Generate, Request |
| `PENDING` | Document requested/in progress | 🟡 Amber indicator | Upload, View Request |
| `RECEIVED` | Document received but not signed | 🟢 Green indicator | View, Sign, Reject |
| `SIGNED` | Document signed and complete | ✅ Green checkmark | View, Download |
| `REJECTED` | Document rejected, needs revision | 🔴 Red indicator | Upload New, Revise |

### Implementation

```javascript
// Documentation state management
class DocumentationDashboard {
  constructor() {
    this.documents = new Map();
  }

  setDocumentState(docCode, state, metadata = {}) {
    const doc = this.documents.get(docCode) || {};
    doc.state = state;
    doc.lastUpdated = new Date().toISOString();
    doc.metadata = { ...doc.metadata, ...metadata };
    
    this.documents.set(docCode, doc);
    this.updateUI(docCode, doc);
  }

  updateUI(docCode, doc) {
    const row = document.querySelector(`[data-testid="docs-row-${docCode}"]`);
    if (!row) return;

    const indicator = row.querySelector('.status-indicator');
    const actions = row.querySelector('.actions');

    switch (doc.state) {
      case 'MISSING':
        indicator.innerHTML = '🔴 Missing';
        actions.innerHTML = '<button>Upload</button><button>Generate</button>';
        break;
      case 'PENDING':
        indicator.innerHTML = '🟡 Pending';
        actions.innerHTML = '<button>Upload</button><button>View Request</button>';
        break;
      case 'RECEIVED':
        indicator.innerHTML = '🟢 Received';
        actions.innerHTML = '<button>View</button><button>Sign</button><button>Reject</button>';
        break;
      case 'SIGNED':
        indicator.innerHTML = '✅ Complete';
        actions.innerHTML = '<button>View</button><button>Download</button>';
        break;
      case 'REJECTED':
        indicator.innerHTML = '🔴 Rejected';
        actions.innerHTML = '<button>Upload New</button><button>Revise</button>';
        break;
    }

    // Add sync badge
    const syncBadge = row.querySelector('.sync-badge');
    syncBadge.textContent = doc.synced ? 'Synced' : 'Pending';
    syncBadge.className = `sync-badge ${doc.synced ? 'synced' : 'pending'}`;
  }
}
```

### PSP Notification Rules

**For 302/303 commitments**:
- Auto-queue PSP notification tasks (upload + mark-sent)
- If physician records "No severe mental disability," show second PSP task ("No SMD" notice)

```javascript
// Auto-queue PSP tasks for involuntary commitments
function handleCommitmentStatusChange(patient, newStatus) {
  if (['302_INVOLUNTARY', '303_EXTENDED'].includes(newStatus)) {
    // Queue PSP notification task
    queueDocumentTask(patient.id, 'PSP_NOTICE', {
      type: 'upload_and_send',
      urgency: 'immediate',
      autoGenerate: true
    });
  }
}
```

## 💾 Persistence Policy

### HIPAA Compliance Rules

**Default: API-first; local cache OFF in prod** (`CRC_ENABLE_LOCAL_CACHE=0`)

**If non-prod cache is enabled**:
- AES-GCM encrypted
- TTL 24 hours max
- Visible "Local Only" badge on cached data
- No PHI in localStorage without explicit encryption

### Safe localStorage Parser

```javascript
// Safe JSON parsing for localStorage
function loadJson(key, fallback) {
  try { 
    const raw = localStorage.getItem(key); 
    return raw ? JSON.parse(raw) : fallback; 
  } catch { 
    return fallback; 
  }
}

// Encrypted storage for PHI (when cache enabled in dev)
class EncryptedStorage {
  constructor() {
    this.isEnabled = import.meta.env.CRC_ENABLE_LOCAL_CACHE === '1';
    this.ttl = 24 * 60 * 60 * 1000; // 24 hours
  }

  async setItem(key, data) {
    if (!this.isEnabled) return;
    
    const encrypted = await this.encrypt(JSON.stringify(data));
    const item = {
      data: encrypted,
      timestamp: Date.now(),
      ttl: this.ttl
    };
    
    localStorage.setItem(`encrypted_${key}`, JSON.stringify(item));
  }

  async getItem(key, fallback = null) {
    if (!this.isEnabled) return fallback;
    
    try {
      const item = JSON.parse(localStorage.getItem(`encrypted_${key}`));
      if (!item) return fallback;
      
      // Check TTL
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`encrypted_${key}`);
        return fallback;
      }
      
      const decrypted = await this.decrypt(item.data);
      return JSON.parse(decrypted);
    } catch {
      return fallback;
    }
  }

  async encrypt(data) {
    // AES-GCM encryption implementation
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(data)
    );
    
    return { encrypted: Array.from(new Uint8Array(encrypted)), iv: Array.from(iv) };
  }

  async decrypt(encryptedData) {
    // Implementation for decryption
    // (Store key securely or derive from user session)
  }
}
```

### Production Policy

**Prod builds require `CRC_ENABLE_LOCAL_CACHE=0`**. If set to `1` in non-prod, cached payloads must be AES-GCM encrypted and auto-purge in 24h.

## 🛠️ Module Implementation Guide

### 1. Facility Finder Module (`src/facilityFinder.js`)

```javascript
// Export pure, testable functions
export function filterFacilities(facilities, criteria) {
  return facilities.filter(facility => {
    if (criteria.levelOfCare && facility.levelOfCare !== criteria.levelOfCare) {
      return false;
    }
    
    if (criteria.acceptsInsurance && !facility.acceptedInsurance.includes(criteria.insurance)) {
      return false;
    }
    
    if (criteria.maxDistance) {
      const distance = calculateDistance(facility.location, criteria.userLocation);
      if (distance > criteria.maxDistance) return false;
    }
    
    return true;
  });
}

export function rankFacilities(facilities, preferences) {
  return facilities
    .map(facility => ({
      ...facility,
      score: calculateFacilityScore(facility, preferences)
    }))
    .sort((a, b) => b.score - a.score);
}
```

### 2. Status Derivation Module (`src/status/derive.js`)

```javascript
// Pure functions for status computation
export function deriveSearchStatus(search) {
  const events = search.events || [];
  if (events.length === 0) return 'PENDING';
  
  const latestEvent = events[events.length - 1];
  const statusMap = {
    'SEARCH_CREATED': 'ACTIVE',
    'FACILITY_CONTACTED': 'ACTIVE', 
    'FACILITY_SELECTED': 'SELECTED_FOR_TRANSFER',
    'PLACEMENT_CONFIRMED': 'CONFIRMED',
    'PLACEMENT_CANCELLED': 'CANCELLED'
  };
  
  return statusMap[latestEvent.type] || 'ACTIVE';
}

export function derivePatientStatus(patient) {
  const searches = patient.searches || [];
  if (searches.length === 0) return 'NO_ACTIVE_SEARCH';
  
  const activeSearches = searches.filter(s => 
    ['ACTIVE', 'SELECTED_FOR_TRANSFER'].includes(deriveSearchStatus(s))
  );
  
  if (activeSearches.length === 0) return 'SEARCH_COMPLETE';
  if (activeSearches.some(s => deriveSearchStatus(s) === 'SELECTED_FOR_TRANSFER')) {
    return 'TRANSFER_PENDING';
  }
  
  return 'ACTIVE_SEARCH';
}
```

### 3. API Client Module (`src/persistence/api.js`)

```javascript
// HTTP client with proper error handling
export class ApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
    this.timeout = 30000;
  }

  async request(method, path, data = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: data ? JSON.stringify(data) : null,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async saveSearch(patientId, searchData) {
    try {
      const result = await this.request('POST', `/patients/${patientId}/searches`, searchData);
      
      // Update UI with success indicator
      this.showSyncStatus(patientId, 'synced');
      
      return result;
    } catch (error) {
      // Show error state in UI
      this.showSyncStatus(patientId, 'error', error.message);
      throw error;
    }
  }

  showSyncStatus(patientId, status, message = '') {
    const indicator = document.querySelector(`[data-patient-id="${patientId}"] .sync-indicator`);
    if (indicator) {
      indicator.className = `sync-indicator ${status}`;
      indicator.textContent = status === 'synced' ? '✅ Synced' : 
                             status === 'pending' ? '🔄 Saving...' : 
                             '❌ Error';
      indicator.title = message;
    }
  }
}
```

## ♿ Accessibility & Compliance

### Axe Builder Integration

**AxeBuilder runs in CI limited to serious/critical**. Keep list of accepted exceptions with remediation dates.

```javascript
// Accessibility testing configuration
const axeConfig = {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'screen-reader': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'section508'],
  exclude: [
    // Documented exceptions with remediation dates
    '.legacy-component' // TODO: Fix by 2025-12-01
  ]
};
```

### PHI Logging Rules

**No PHI in console logs or analytics**. If you need request tracing, hash patient IDs and include request_id.

```javascript
// Safe logging utility
function logSafely(level, message, data = {}) {
  const safeData = { ...data };
  
  // Hash any patient identifiers
  if (safeData.patientId) {
    safeData.patientId = hashPatientId(safeData.patientId);
  }
  
  // Remove PHI fields
  delete safeData.ssn;
  delete safeData.medicalRecordNumber;
  delete safeData.patientName;
  
  console[level](`[${new Date().toISOString()}] ${message}`, safeData);
}
```

## ✅ Definition of Done (UI Features)

### Checklist for Every Feature

- [ ] **E2E selectors added and exercised** with proper data-testids
- [ ] **Save calls awaited**; error path shows toast + "Unsynced" indicator
- [ ] **Docs dashboard updated** (if feature touches paperwork)
- [ ] **Commitment rules enforced** (PA-specific filtering)
- [ ] **Status derivation tested** with edge cases
- [ ] **Accessibility validated** (axe-core passes)
- [ ] **No PHI in logs** or client-side storage without encryption
- [ ] **Mobile scroll guards** implemented for touch interactions
- [ ] **Guide updated** in `development/prototypes/ui_prototype/README.md`

### Code Quality Gates

```bash
# Pre-commit validation
npm run lint          # ESLint + security rules
npm run format        # Prettier formatting
npm run test:unit     # Unit tests pass
npm run test:e2e      # E2E tests pass
npm run accessibility # Axe compliance check
```

## 🔄 Environment Matrix

### Required Environment Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | `https://staging-api.domain.com` | `https://api.domain.com` | API server endpoint |
| `CRC_ENABLE_LOCAL_CACHE` | `1` | `0` | `0` | Enable local PHI caching |
| `VITE_ENABLE_PLACEMENT_SEARCH` | `true` | `true` | `true` | Placement search feature |
| `VITE_ENABLE_ASSESSMENT_MODULE` | `true` | `true` | `true` | Assessment functionality |
| `VITE_ENABLE_FACILITY_FINDER` | `true` | `true` | `true` | Facility finder |
| `VITE_ENABLE_DEBUG` | `true` | `false` | `false` | Debug logging |

### Feature Flags

Control feature availability via environment variables:

```javascript
// Feature flag utility
export const features = {
  placementSearch: import.meta.env.VITE_ENABLE_PLACEMENT_SEARCH === 'true',
  assessment: import.meta.env.VITE_ENABLE_ASSESSMENT_MODULE === 'true',
  facilityFinder: import.meta.env.VITE_ENABLE_FACILITY_FINDER === 'true',
  debug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
};

// Usage in components
if (features.placementSearch) {
  // Render placement search UI
}
```

## 🚀 Development Workflow

### HMR vs Netlify Preview

**Development**: Use `npm run dev` for hot module replacement and fast iteration.

**Preview**: Use `npm run preview -- --host` to catch absolute path issues before Netlify deployment.

### Module-Friendly Server

The Vite development server is configured for ES modules with proper MIME types and import resolution.

```javascript
// vite.config.js
export default {
  server: {
    host: '0.0.0.0',
    port: 5174
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
};
```

---

**🔄 Last Updated**: September 29, 2025  
**✅ Guide Status**: Complete with all requirements implemented  
**🚨 Next Update Required**: When component architecture or rules change