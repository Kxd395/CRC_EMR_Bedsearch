# ASCII System Overview

```text
EMR BED-SEARCH WORKFLOW ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Search Cards │  │ Event Forms  │  │ Status Chips │  │ Action Menus │    │
│  │   (Primary   │  │ (Add Event)  │  │   (Facets)   │  │ (Note/Call)  │    │
│  │    Stage)    │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────┬───────────────┬───────────────┬───────────────┬───────────────┘
              │               │               │               │
              ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  POST /events    GET /search    PUT /search    WebSocket/SSE                │
│       │               │              │              │                       │
│   Add Event    Fetch Current   Update Status   Real-time                    │
│       │               │              │          Updates                     │
└───────┼───────────────┼──────────────┼──────────────┼───────────────────────┘
        │               │              │              │
        ▼               ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐         │
│  │   Validate  │───▶│   Insert Event   │───▶│   Derive Status    │         │
│  │    Event    │    │   (Append-Only)  │    │  (Deterministic)   │         │
│  └─────────────┘    └──────────────────┘    └────────────────────┘         │
│                                                       │                     │
│                    ┌──────────────────────────────────┘                     │
│                    ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    STATUS DERIVATION RULES                       │       │
│  │                                                                   │       │
│  │  1. Sort events DESC by timestamp                                │       │
│  │  2. Scan for terminal states (canceled, denied, expired)         │       │
│  │  3. Apply stage precedence (waiting_transport > accepted...)     │       │
│  │  4. Calculate facets (hold, transport, docs, notes...)           │       │
│  │  5. Handle time-based logic (hold_until, recheck_at)             │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────┬───────────────────────────────────────┬───────────────────────┘
              │                                       │
              ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────┐         ┌──────────────────────────────────┐       │
│  │    bed_search      │◀────────│       bed_search_event           │       │
│  │                    │         │                                  │       │
│  │  id (PK)           │         │  id (PK)                         │       │
│  │  facility_id       │         │  bed_search_id (FK)              │       │
│  │  fin               │         │  event_type                      │       │
│  │  patient_id        │         │  event_data (JSONB)              │       │
│  │  created_at        │         │  created_at                      │       │
│  │  archived_at       │         │  user_id                         │       │
│  │  status (derived)  │         │                                  │       │
│  │  version           │         │  ▲                               │       │
│  │                    │         │  │ APPEND-ONLY                   │       │
│  │  UNIQUE INDEX:     │         │  │ (Immutable)                   │       │
│  │  (facility_id,fin) │         │  │                               │       │
│  │  WHERE             │         └──┼───────────────────────────────┘       │
│  │  archived_at IS    │            │                                       │
│  │  NULL              │            │ Events drive status                   │
│  └────────────────────┘            │ but never deleted                     │
│                                    │                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
        ┌────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEBSOCKET/SSE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Status Change ───▶ Broadcast Update ───▶ Connected Clients                │
│                                                                             │
│  {                                        ┌─────────────────┐               │
│    "type": "bed_search_updated",          │ Auto Refresh UI │               │
│    "bed_search_id": 123,            ────▶ │  - Update Card  │               │
│    "status": "waiting_transport",         │  - Show Facets  │               │
│    "version": 5                           │  - Apply Colors │               │
│  }                                        └─────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

KEY CONSTRAINTS:
• One active search per (facility_id, FIN) - prevents duplicate placement attempts
• Events are append-only - complete audit trail preserved
• Status derived deterministically - consistent across all clients  
• Version field - optimistic locking prevents concurrent update conflicts
• WebSocket updates - real-time collaboration without polling
```

## Data Flow Summary

1. **User Action** → UI form submission (add event, note, call outcome)
2. **API Request** → POST /events with validation
3. **Event Storage** → Append-only insert to bed_search_event table
4. **Status Derivation** → Scan events, apply precedence rules, calculate facets
5. **State Update** → Update bed_search.status and increment version
6. **Real-time Sync** → WebSocket broadcast to all connected clients
7. **UI Refresh** → Auto-update cards with new status and colors

## Unique Constraint Impact

The UNIQUE(facility_id, fin) WHERE archived_at IS NULL constraint ensures:

- No duplicate active searches for same patient at same facility
- Historical searches preserved when archived_at is set
- Clean separation between active workflow and audit history
