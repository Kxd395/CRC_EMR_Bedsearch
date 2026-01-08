# Codex Prompt for Bed-Search System

This document provides context for AI coding assistants working with the EMR bed-search workflow system.

## System Overview

The bed-search system manages patient placement requests using an append-only event model with derived status display. Key architectural principles:

- **Single Source of Truth**: All state changes recorded as immutable events
- **Derived Display**: Current status computed deterministically from event history
- **One Active Search**: UNIQUE constraint on (facility_id, FIN) per active placement
- **Dual-State Model**: Primary stage determines card color, facets show additional context

## Event Model

Events are append-only records with these types:

```typescript
type EventType = 
  | 'call_outcome'      // no_beds, bed_available, facility_denied, patient_denies
  | 'docs_sent'         // Documentation transmitted
  | 'packet_sent'       // Information packet sent
  | 'acceptance'        // Facility accepts with optional hold_until
  | 'transport_scheduled' // Transport arranged with pickup_at
  | 'note'              // User annotation (info/change/admin/reassess)
  | 'status_override'   // Admin override (rare)
```

## Status Derivation

Status is computed by scanning events in reverse chronological order:

1. **Primary Stage** (determines card color):
   - `canceled` (patient/facility denies)
   - `denied` (facility rejection)
   - `expired` (hold_until passed with no newer acceptance)
   - `waiting_transport` (transport scheduled)
   - `accepted` (facility acceptance)
   - `packet_sent` (documentation sent)
   - `no_beds` (facility has no availability)
   - `pending_review` (requires staff attention)
   - `searching` (default state)

2. **Facets** (displayed as status chips):
   - `accepted`, `hold`, `transport`, `docs`, `recheck`, `insurance`, `reassess`, `note`

## Database Schema

```sql
-- Primary search record
CREATE TABLE bed_search (
  id SERIAL PRIMARY KEY,
  facility_id INT NOT NULL,
  fin VARCHAR NOT NULL,
  patient_id INT,
  created_at TIMESTAMP,
  archived_at TIMESTAMP,
  status VARCHAR, -- derived field
  version INT DEFAULT 1, -- optimistic locking
  UNIQUE(facility_id, fin) WHERE archived_at IS NULL
);

-- Immutable event log
CREATE TABLE bed_search_event (
  id SERIAL PRIMARY KEY,
  bed_search_id INT REFERENCES bed_search(id),
  event_type VARCHAR NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INT
);
```

## Status Palette

Use these exact color values from the codebase:

| Status | Badge | Background | Label |
|--------|-------|------------|--------|
| searching | #ffffff | #6b7280 | Searching |
| pending_review | #000000 | #fbbf24 | Pending Review |
| no_beds | #ffffff | #ef4444 | No Beds |
| packet_sent | #000000 | #a78bfa | Packet Sent |
| accepted | #ffffff | #10b981 | Accepted |
| waiting_transport | #ffffff | #3b82f6 | Waiting Transport |
| expired | #ffffff | #f59e0b | Expired |
| denied | #ffffff | #dc2626 | Denied |
| canceled | #ffffff | #6b7280 | Canceled |

## Key Functions

When working with status display:

```javascript
// Normalize status keys to snake_case
function normalizeStatusKey(status) {
  return status?.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Auto-select badge text color for accessibility
function pickBadgeTextColor(bgHex) {
  // Returns #ffffff or #000000 based on WCAG contrast ratio
}

// Apply status theme to DOM elements
function injectStatusThemeStyles(element, status) {
  // Sets CSS custom properties for consistent theming
}
```

## Time-Based Logic

Handle temporal aspects:

- **hold_until**: Future timestamp for delayed placement
- **recheck_at**: When to follow up (styling: due/overdue)
- **pickup_at**: Scheduled transport time

Check `new Date() > hold_until` to determine if hold has expired.

## WebSocket Updates

Status changes trigger real-time updates:

```javascript
// After event insert and status derivation
websocket.broadcast({
  type: 'bed_search_updated',
  bed_search_id: id,
  status: newStatus,
  version: newVersion
});
```

## Common Patterns

1. **Adding Events**: Always increment version for optimistic locking
2. **Status Display**: Use derived status, not event type directly
3. **Unique Constraint**: Check for existing active search before creating
4. **Time Handling**: Store UTC, display in user's timezone
5. **Access Control**: Log user_id with all events

## Testing Scenarios

Key test cases to verify:

- Patient acceptance followed by transport scheduling → `waiting_transport`
- Patient denial → `canceled`
- Hold expires without newer acceptance → `expired`
- Multiple facilities, same FIN → separate active searches allowed
- Event ordering independence → deterministic status derivation
