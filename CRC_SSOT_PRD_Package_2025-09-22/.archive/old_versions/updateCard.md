Below is a complete pattern for multi-user bed-search updates—how the card looks and behaves as events roll in from different users, plus the data model, status derivation, concurrency, and what we should do in this area.

I’ll walk through your exact scenario:

	1.	Call #1 → No bed.
	2.	3 hours later → Bed available + clinical sent.
	3.	Return call (3rd user) → Patient denies.

You’ll see a compact ASCII mock of the card at each step, and the backend event payloads that generate it.

⸻

1) Event model (source of truth)

We never “overwrite” the card; we append events. The current status is derived from the latest event chronology. This makes multi-user editing safe and auditable.

type BedSearchEventType =
  | 'call_outcome'          // { outcome: 'no_beds' | 'bed_available' | 'patient_denies' | ... }
  | 'docs_sent'             // { docs: ['clinical_packet' | 'tox' | 'insurance' ...] }
  | 'packet_sent'           // optional if you want this explicit
  | 'acceptance'            // { hold_until?: ISO }
  | 'transport_scheduled'   // { pickup_at: ISO }
  | 'note'                  // free-text
  | 'status_override';      // admin

interface BedSearchEvent {
  id: string;
  search_id: string;
  ts: string;              // ISO timestamp (UTC)
  user_id: string;
  type: BedSearchEventType;
  payload: Record<string, any>;
  version: number;         // used for OCC (optimistic concurrency control)
}


⸻

2) Status derivation (pure function)

One consistent rule-set determines the badge on the card:

// priority: last matching rule wins on the timeline (scan newest→oldest)
function deriveStatus(events: BedSearchEvent[]): 'accepted'|'waiting_transport'|'packet_sent'|'pending_review'|'no_beds'|'denied'|'canceled'|'expired'|'searching' {
  for (const e of [...events].sort((a,b)=>b.ts.localeCompare(a.ts))) {
    if (e.type === 'call_outcome' && e.payload.outcome === 'patient_denies') return 'canceled';
    if (e.type === 'acceptance') return 'accepted';
    if (e.type === 'transport_scheduled') return 'waiting_transport';
    if (e.type === 'docs_sent' || e.type === 'packet_sent') return 'packet_sent'; // docs sent = packet out
    if (e.type === 'call_outcome' && e.payload.outcome === 'facility_denied') return 'denied';
    if (e.type === 'call_outcome' && e.payload.outcome === 'no_beds') return 'no_beds';
  }
  return 'searching';
}

You can extend/adjust the priority, e.g., give denied precedence over packet_sent if the denial is later.

⸻

3) ASCII: card UI and how it evolves

A) After Call #1 — No bed

┌─────────────────────────────────────────────────────────────────────────┐
│ Friends Hospital                                    [ no_beds ] (slate) │
│ Updated: 09/22 09:10 • Channels: Fax • Assigned: Morgan Lee             │
│ Summary: No bed available; recheck at 12:00.                             │
│                                                                         │
│  Timeline (3)  ▸                                                         │
│   • 09:10  Morgan Lee  Call outcome: NO BEDS (recheck 12:00)             │
│                                                                         │
│  [ View details ]  [ Edit info ]  [ Record acceptance ]                  │
└─────────────────────────────────────────────────────────────────────────┘

	•	Badge = no_beds (slate) from call_outcome:no_beds.
	•	Show recheck time clearly.

⸻

B) 3 hours later — Bed available + clinical sent

Two events within a short window by User #2:
	1.	call_outcome: bed_available
	2.	docs_sent: ['clinical_packet'] (or packet_sent)

Derived status becomes packet_sent (awaiting response).

┌─────────────────────────────────────────────────────────────────────────┐
│ Friends Hospital                                   [ packet_sent ] blue │
│ Updated: 12:05 • Channels: Fax • Assigned: Morgan Lee                   │
│ Summary: Bed available; clinical packet sent.                            │
│                                                                         │
│  Timeline (5)  ▾                                                         │
│   • 12:05  Kevin Dial   Docs sent: CLINICAL PACKET                       │
│   • 12:02  Kevin Dial   Call outcome: BED AVAILABLE                      │
│   • 09:10  Morgan Lee   Call outcome: NO BEDS (recheck 12:00)            │
│                                                                         │
│  [ View details ]  [ Edit info ]  [ Record acceptance ]                  │
└─────────────────────────────────────────────────────────────────────────┘

	•	New badge = packet_sent (blue).
	•	Timeline expanded automatically for a few seconds (animated “new events” highlight).

⸻

C) Return call (3rd user) — Patient denies

New event: call_outcome: patient_denies → derived status canceled.

┌─────────────────────────────────────────────────────────────────────────┐
│ Friends Hospital                                       [ canceled ] sky │
│ Updated: 13:15 • Channels: Fax • Assigned: Morgan Lee                   │
│ Summary: Patient denied placement; case manager notified.                │
│                                                                         │
│  Timeline (6)  ▾                                                         │
│   • 13:15  CRS Chen     Call outcome: PATIENT DENIES                     │
│   • 12:05  Kevin Dial   Docs sent: CLINICAL PACKET                       │
│   • 12:02  Kevin Dial   Call outcome: BED AVAILABLE                      │
│   • 09:10  Morgan Lee   Call outcome: NO BEDS (recheck 12:00)            │
│                                                                         │
│  [ View details ]  [ Edit info ]  [ Record acceptance (disabled) ]       │
└─────────────────────────────────────────────────────────────────────────┘

	•	Badge = canceled (sky).
	•	Record acceptance disabled due to terminal state; show tooltip “Cannot accept after patient denial.”

⸻

4) What the three events look like (JSON)

[
  {
    "id": "e1",
    "search_id": "s_friends",
    "ts": "2025-09-22T09:10:00Z",
    "user_id": "u_morgan",
    "version": 1,
    "type": "call_outcome",
    "payload": { "outcome": "no_beds", "recheck_at": "2025-09-22T12:00:00Z" }
  },
  {
    "id": "e2",
    "search_id": "s_friends",
    "ts": "2025-09-22T12:02:00Z",
    "user_id": "u_kevin",
    "version": 2,
    "type": "call_outcome",
    "payload": { "outcome": "bed_available" }
  },
  {
    "id": "e3",
    "search_id": "s_friends",
    "ts": "2025-09-22T12:05:00Z",
    "user_id": "u_kevin",
    "version": 3,
    "type": "docs_sent",
    "payload": { "docs": ["clinical_packet"] }
  },
  {
    "id": "e4",
    "search_id": "s_friends",
    "ts": "2025-09-22T13:15:00Z",
    "user_id": "u_crs_chen",
    "version": 4,
    "type": "call_outcome",
    "payload": { "outcome": "patient_denies", "note": "Declined after callback" }
  }
]

Store events append-only. The card re-computes from the latest snapshot.

⸻

5) Multi-user concurrency & “what we should do”

A) Optimistic updates with versioning
	•	Each event write carries a version (or ETag).
	•	If the client posts with version=3 but the server has version=4, return 409 with the latest event stream → client merges and replays the local change.

B) Live presence / new events
	•	Use a small presence bar on the card header: “Kevin Dial is editing…”.
	•	Broadcast new events over WebSocket (or SSE) and briefly highlight their row.

C) Draft + compose
	•	The “Add update” composer sits at the bottom of each card (call outcome, docs sent, note).
	•	Always creates a new event—not patching previous ones.
	•	Soft autocomplete for common outcomes (no bed, bed available, patient denies).

D) Merge rules
	•	Last event wins for status derivation.
	•	Don’t delete or alter earlier events—audit is sacred.

E) Terminal & locks
	•	When derived status enters terminal states (canceled, denied, or accepted with transport scheduled), disable acceptance/packet buttons and show why.

⸻

6) Card layout: reusable sections
	•	Header row: Facility name + status badge; Updated, Channels, Assigned.
	•	Summary line: synthesized one-liner (derived from the latest event).
	•	Timeline: reverse-chronological list with avatars + verbs (call outcome, docs sent, acceptance, transport).
	•	Actions:
	•	View details → drawer (full fields)
	•	Edit info → modal (reason + note + docs quick add)
	•	Record acceptance → disabled when terminal

Keep timeline collapsed by default; expand automatically for N seconds after new events arrive.

⸻

7) Visual tokens (status → color)

Use a single map everywhere:

const STATUS_STYLES = {
  searching:         { badge:'#6B7280', bg:'#F3F4F6', icon:'spinner' },
  packet_sent:       { badge:'#2563EB', bg:'#EFF6FF', icon:'send' },
  accepted:          { badge:'#16A34A', bg:'#ECFDF5', icon:'check' },
  waiting_transport: { badge:'#4F46E5', bg:'#EEF2FF', icon:'car' },
  pending_review:    { badge:'#D97706', bg:'#FFFBEB', icon:'clock' },
  no_beds:           { badge:'#334155', bg:'#F1F5F9', icon:'bed-x' },
  denied:            { badge:'#DC2626', bg:'#FEF2F2', icon:'x' },
  canceled:          { badge:'#0EA5E9', bg:'#F0F9FF', icon:'ban' },
  expired:           { badge:'#52525B', bg:'#FAFAFA', icon:'hourglass' },
  reassess_required: { badge:'#C026D3', bg:'#FDF4FF', icon:'alert' }
} as const;


⸻

8) Edge cases & good defaults
	•	Conflicting events (e.g., acceptance then patient_denies): latest wins for badge; keep both in timeline.
	•	Docs received after denial: allow event (for audit) but show info note “Docs received after terminal state”.
	•	Back-date entry: permit only with admin role + “back-dated” label.
	•	Edit/delete event: disallow delete; editing restricted to note text only; outcome changes create new events.

⸻

9) Acceptance criteria (for QA)
	•	Two users can add events without clobbering each other; latest event re-computes the badge.
	•	The card shows correct badge progression for your scenario: no_beds → packet_sent → canceled.
	•	Button states update in sync: Record acceptance disabled after patient_denies.
	•	Presence banner shows when another user is composing; new events highlight for a moment.
	•	Finalize state respects derived status and commitment rules (from our previous policy).

⸻

10) Why this works well
	•	Append-only events = no lost work, perfect audit, easy multi-user.
	•	Derived status = a single source of truth for badge, filters, and downstream flows.
	•	Consistent style map = color logic never drifts.
	•	Live hints (presence + highlight) = no “who just changed this?” confusion.

If you want, I’ll package this as:
	•	/src/policy/bedsearch.ts (deriveStatus + event types),
	•	/src/components/BedSearchCard.tsx (header/summary/timeline/actions),
	•	a tiny store with versioned event appends and a mock WebSocket emitter.

Confidence: 93%