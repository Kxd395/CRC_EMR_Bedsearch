# Transport Scheduling Implementation Specification

This document outlines the implementation details for automatic transport scheduling functionality in the EMR bed-search system.

## Overview

When staff enters a pickup time, the system automatically:
- Sets the "Transport" chip 
- Promotes the card to `waiting_transport` status
- No manual chip toggling required - everything is event-driven

## 1. Event Structure

### Event Type
```javascript
type: 'transport_scheduled'
```

### Payload Schema
```json
{
  "type": "object",
  "required": ["pickup_at"],
  "properties": {
    "pickup_at": { "type": "string", "format": "date-time" },
    "vendor_name": { "type": "string", "minLength": 1 },
    "mode": { 
      "type": "string", 
      "enum": ["ambulance", "wheelchair_van", "BLS", "ALS", "rideshare_nonclinical"] 
    },
    "pickup_location": { "type": "string" },
    "destination_facility_id": { "type": "integer" },
    "escort_required": { "type": "boolean" },
    "transport_request_id": { "type": "string" }
  },
  "additionalProperties": false
}
```

## 2. Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pickup_at` | datetime (UTC) | ✅ | Primary driver; must be >= "now – 10m" |
| `vendor_name` | text | — | e.g., "AmeriTran EMS" |
| `mode` | enum | — | ambulance, wheelchair_van, BLS, ALS, rideshare_nonclinical |
| `pickup_location` | text | — | e.g., "Einstein Main – CRC" |
| `destination_facility_id` | FK | — | tie it to the chosen facility |
| `escort_required` | boolean | — | flag staffing |
| `transport_request_id` | text | — | external EMR/dispatcher ID |

## 3. Status Derivation Rules

### Primary Stage Logic
- `transport_scheduled` promotes card to `waiting_transport`
- When `pickup_at <= now`, stage returns to `accepted` unless terminal event overrides
- `pickup_at` supersedes acceptance hold timers while pending

### Facet Logic
- **Transport chip**: `transport = { pickup_at, state: 'scheduled'|'past' }`
- State becomes 'past' when `pickup_at <= now`
- Chip shows pickup time: "Transport · 3:30 PM"

### Precedence (highest to lowest)
1. `canceled` (patient/facility denies)
2. `denied` (facility rejection) 
3. `expired` (hold_until passed)
4. **`waiting_transport`** ← NEW
5. `accepted`
6. `packet_sent`
7. `no_beds`
8. `pending_review`
9. `searching`

## 4. UI Behavior

### On Submit
- UI sends `POST /events` with `type: 'transport_scheduled'`
- Server appends event, recomputes status/facets
- WebSocket broadcasts update to all clients

### Visual Changes
- Card color immediately flips to "Waiting Transport" (blue #3b82f6)
- Transport chip appears: "Transport · 3:30 PM"
- When time passes, chip switches to subtle "past" style
- Card color returns to "Accepted" unless newer terminal event

### Error Handling
- 409 concurrency: UI refreshes from `GET /search`, retries with new version
- Validation errors: Show inline form validation

## 5. Test Cases

### Case 1: Basic Transport Scheduling
```javascript
events: [
  { type: 'acceptance', data: { hold_until: '2025-09-25T17:00:00Z' } },
  { type: 'transport_scheduled', data: { pickup_at: '2025-09-25T16:30:00Z' } }
]
expected: {
  stage: 'waiting_transport',
  facets: ['accepted', 'hold(future)', 'transport(scheduled)']
}
```

### Case 2: Time-Based Transition
```javascript
// After 16:30 with no clearing event
expected: {
  stage: 'accepted',
  facets: ['transport(past)']
}
```

### Case 3: Terminal Event Override
```javascript
events: [
  { type: 'transport_scheduled', data: { pickup_at: '2025-09-25T16:30:00Z' } },
  { type: 'call_outcome', data: { outcome: 'patient_denies' } }
]
expected: {
  stage: 'canceled', // terminal overrides transport
  facets: []
}
```

### Case 4: Admin Override
```javascript
events: [
  { type: 'transport_scheduled', data: { pickup_at: '2025-09-25T16:30:00Z' } },
  { type: 'status_override', data: { status: 'denied' } }
]
expected: {
  stage: 'denied',
  facets: ['override']
}
```

## 6. EMR Integration (FHIR Mapping)

| Concept | FHIR Resource | Key Fields |
|---------|---------------|------------|
| Transport appointment | Appointment | status=booked, start=pickup_at, serviceType=patient transport |
| Vendor assignment | Task | code=transport, executionPeriod.start=pickup_at, owner=vendor Organization |
| Bed search | ServiceRequest | code=placement, reasonCode (level of care) |

## 7. Implementation Checklist

- [ ] Add `transport_scheduled` to event type enum
- [ ] Update status derivation logic with `waiting_transport` precedence
- [ ] Add transport facet calculation with time-based state
- [ ] Create "Schedule Transport" form UI
- [ ] Add form validation for pickup_at >= now-10m
- [ ] Implement JSON schema validation server-side
- [ ] Add WebSocket broadcast for transport updates
- [ ] Create unit tests for all 4 scenarios
- [ ] Add transport chip styling (scheduled/past states)
- [ ] Update status palette with `waiting_transport` color
- [ ] Add background scheduler for automatic state transitions

## 8. Database Changes

### Event Data Examples
```sql
-- transport_scheduled event
INSERT INTO bed_search_event (bed_search_id, event_type, event_data, user_id)
VALUES (123, 'transport_scheduled', '{
  "pickup_at": "2025-09-25T16:30:00Z",
  "vendor_name": "AmeriTran EMS", 
  "mode": "BLS",
  "pickup_location": "Einstein Main – CRC",
  "destination_facility_id": 456,
  "escort_required": false,
  "transport_request_id": "EMR-TRANS-789"
}', 1);
```

### Status Update
```sql
-- Automatic status derivation result
UPDATE bed_search 
SET status = 'waiting_transport', version = version + 1 
WHERE id = 123;
```