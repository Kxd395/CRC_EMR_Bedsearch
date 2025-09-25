# Derivation Specification — Primary Stage & Facets

Sources: `ui_prototype/src/app.js` (status helpers), `ui_prototype/src/data/newPatientScenarios.js` (event timelines), `RESTORE_NOTES.md`.

## Overview

State is derived, never stored. Each bed-search card rebuilds by replaying append-only events associated with (`facility_id`, `FIN`). Processing rules must be deterministic: sort events descending by timestamp ( breaking ties with monotonically increasing `version` ), then scan once to choose the primary stage and accumulate facets.

## Time Semantics

- `hold_until`: If latest acceptance has a future hold, keep `hold` facet active. When the hold time passes without a fresher acceptance or transport, stage downgrades to `expired` and `hold` facet clears.
- `recheck_at`: When present on a call outcome, track as `recheck` facet. Mark it `due` when now < `recheck_at`, `overdue` once now ≥ `recheck_at`.
- Transport pickup times supersede acceptance holds; once pickup passes, stage falls back to `accepted` (unless transport confirmation clears card entirely).

## Deterministic Stage Selection

1. Normalize every event-driven status via `normalizeStatusKey`.
2. Scan events (latest → oldest) keeping the first stage that matches precedence order.
3. Terminals (`canceled`, `denied`, `expired`) stop the scan early.
4. `reassess_required` can overlay any other stage when the latest event mandates reassessment.

### Pseudocode: `deriveStage(events)`

```pseudo
function deriveStage(events, now):
  precedence = [
    'canceled',
    'denied',
    'expired',
    'waiting_transport',
    'accepted',
    'packet_sent',
    'no_beds',
    'pending_review',
    'searching'
  ]

  latestHold = null
  latestTransport = null
  reassess = false

  for event in events sorted by (ts desc, version desc):
    case event.type of
      'status_override':
        return normalizeStatusKey(event.payload.status)
      'note':
        if event.payload.category == 'reassess':
          reassess = true
      'transport_scheduled':
        latestTransport = event
        return 'waiting_transport'
      'acceptance':
        latestHold = event
        return 'accepted'
      'docs_sent' or 'packet_sent':
        return 'packet_sent'
      'call_outcome':
        switch event.payload.outcome:
          'patient_denies': return 'canceled'
          'facility_denied': return 'denied'
          'no_beds': return 'no_beds'
          'bed_available': continue
  # Fallbacks
  return 'searching'

  # Post-processing overlays
  if reassess:
    return 'reassess_required'

  if latestHold and latestHold.payload.hold_until < now and not latestTransport:
    return 'expired'
```

The pseudocode highlights precedence without duplicating UI logic; terminals return immediately. The final expired check executes after the primary loop to ensure the hold grace period is respected.

## Facet Accumulation

Facets are booleans with optional metadata displayed as chips.

### Pseudocode: `deriveFacets(events)`

```pseudo
function deriveFacets(events, now):
  facets = empty dictionary

  for event in events sorted by (ts desc, version desc):
    switch event.type:
      case 'acceptance':
        if not facets.accepted:
          facets.accepted = true
          if event.payload.hold_until:
            if event.payload.hold_until > now:
              facets.hold = {
                state: 'future',
                until: event.payload.hold_until
              }
            else if not facets.transport:
              facets.expired_hold = true
      case 'transport_scheduled':
        if not facets.transport:
          facets.transport = {
            pickup_at: event.payload.pickup_at
          }
          if event.payload.pickup_at and event.payload.pickup_at <= now:
            facets.transport.state = 'past'
      case 'docs_sent' or 'packet_sent':
        facets.docs = {
          type: event.type,
          docs: event.payload.docs
        }
      case 'call_outcome':
        if event.payload.recheck_at:
          facets.recheck = {
            due_at: event.payload.recheck_at,
            state: now < event.payload.recheck_at ? 'scheduled' : 'overdue'
          }
        if event.payload.outcome == 'bed_available':
          facets.availability = true
        if event.payload.outcome == 'patient_denies':
          facets.note = 'Patient declined'
      case 'note':
        facets.note = event.payload.category or 'info'
        if event.payload.category == 'reassess':
          facets.reassess = true
      case 'status_override':
        facets.note = 'Override recorded'
        facets.override = true
  return facets
```

Facets retain the first-seen value in descending order, ensuring the most recent truth wins.

## Example Scenarios (Deterministic Outcomes)

| Scenario | Events (latest first) | Expected Stage | Expected Facets |
| --- | --- | --- | --- |
| Accepted + transport scheduled | `transport_scheduled(pickup 16:30)`, `acceptance(hold 17:00)` | `waiting_transport` | `accepted`, `hold (future)`, `transport` |
| Patient denies after packet sent | `call_outcome(patient_denies)`, `packet_sent` | `canceled` | `docs`, `note` (Patient declined) |
| Hold expires without update | `call_outcome(bed_available)`, `acceptance(hold 12:00)` and now=13:00 | `expired` | `accepted` (historical), `hold` absent, optional `expired_hold` |
| Re-check overdue | `call_outcome(no_beds, recheck_at yesterday)` | `no_beds` | `recheck (overdue)` |
| Docs only | `docs_sent` | `packet_sent` | `docs` |
| Override to denied | `status_override(status='denied')`, previous acceptance | `denied` | `override`, `note` |

These examples match both the precedence chain and the append-only, single-pass derivation rules described above.
