# CRC Facility Finder — Detailed Implementation Spec

**Purpose**: Provide build-ready guidance for the in-workflow Facility Finder so the Epic and front-end teams can implement the live, ranked directory lookup that supports CRC placement decisions. Mirrors operational expectations: fast, patient-aware, governed, and fully audited.

---

## 1. Feature Overview
- Facility Finder is the operational search experience surfaced inside the CRC Navigator.
- Pulls from the live operational directory (Chronicles record type or sanctioned API) — never Clarity/Caboodle for read/write.
- Auto-contextualises results using the current patient’s SSOT SDEs (ASAM, MAT, acuity, 302, payer, consent flags).
- Presents ranked facility cards with stale/high-risk indicators, quick actions, and validation flows (Confirm/Warn/Block).
- Guarantees response in <2s typical with clear failover messaging.

---

## 2. UI Components & Behaviour

### 2.1 Search & Filter Bar (top row)
- **Search input**: single-line (facility name, city, partial strings); shows suggested matches after 2 characters.
- **Filter chips** (multi-select unless noted):
  - ASAM Level (`2.1`, `3.1`, `3.5`, etc.).
  - MAT type (Methadone Induction, Methadone Continue, Suboxone Induction, Suboxone Continue).
  - Acute BH, Acute Medical Stabilisation (checkboxes).
  - Accepts 302 (toggle).
  - Payer dropdown (source: payer→plan map).
  - Hide stale (>30d old) (toggle).
  - Distance radius (if geolocation available; optional slider/chip).
- **Patient presets**: default filters seeded from `SDE.CRC.RUNNOTE.ASAM_REQUESTED`, `SDE.CRC.RUNNOTE.MAT_NEEDS`, `SDE.CRC.RUNNOTE.MEDICAL_ACUITY_REQUIRED`, `SDE.CRC.RUNNOTE.302_REQUIRED`.

### 2.2 Results List (cards)
Each card/row shows:
- Facility name, city, distance (if geocoded).
- Badge row: ASAM coverage, Methadone ✓/✗ (induction/continue), Suboxone ✓/✗, Acute BH ✓/✗, Acute Med Stab ✓/✗, Accepts 302 ✓/✗, Dual Dx ✓/✗, BH Med Initiation ✓/✗.
- Payer summary (in-network icons/text).
- Bed status chip with timestamp (Open, Waitlist, Hold, Unknown).
- Last verified timestamp with colour-coded freshness badge:
  - ≤14d green, 15–30d amber, >30d red.
- Optional match score label (Match 87%).
- Quick actions: `Call`, `Send packet`, `Select`, `More`.
- Expanded details (on `More`): contact name/phone/direct address/fax, transfer instructions, capacity note, verification history.

### 2.3 Empty / No Results State
- Copy: “No facilities match these filters. Try removing ‘ASAM 3.7’ or toggle ‘Hide stale.’”
- Buttons: `Show alternatives (nearby matches)` (drops match threshold) and `Search statewide` (opens widened query).

### 2.4 Selection Modal (BPA harness)
- Triggered on `Select` quick action.
- **Confirm (green)**: facility matches; copy “Facility supports ASAM 3.1 and MethadoneContinue. Proceed?” Buttons: `Cancel`, `Continue`.
- **Warn (amber)**: soft conflicts (e.g., stale verification). Copy includes alternative suggestions. Buttons: `Choose alternative` (auto opens top 3) and `Proceed (audit required)`.
- **Block (red)**: hard conflict (e.g., no MethadoneContinue). Buttons: `Override (audit)` (requires reason, logs `OVERRIDE_REASON`) and `Cancel`. Override restricted to roles with permission; writes `SDE.CRC.RUNNOTE.OVERRIDE_*`.

### 2.5 Accessibility
- Keyboard navigation through search, filters, results (arrow/enter), modals (Esc to close).
- Screen-reader labels on badges and buttons. Colour combinations meet WCAG AA.

---

## 3. API Contract (operational store)

**Endpoint**: `GET /api/facilities`

**Query params** (all optional unless noted):
- `query` – free text search.
- `asams` – comma-delimited ASAM levels.
- `mat` – MAT need key.
- `acute_bh` – boolean.
- `acute_med_stab` – boolean.
- `requires_302` – boolean.
- `payer` – payer id.
- `hide_stale` – boolean (default true).
- `distance_mi` – numeric radius when geo data available.
- `page`, `pageSize` – pagination (default 1 / 25). Max pageSize 50.

**Sample request**:
```
GET /api/facilities?query=&asams=3.1,2.1&mat=MethadoneContinue&acute_bh=true&payer=MEDICAID&hide_stale=true&page=1&pageSize=25
```

**Sample response**:
```json
{
  "meta": {"total": 123, "page": 1, "pageSize": 25, "tookMs": 120},
  "results": [
    {
      "facility_id": "WSD-001",
      "name": "Westside Detox",
      "city": "Philadelphia",
      "distance_miles": 2.1,
      "asam_levels": ["2.1", "3.1"],
      "badges": {
        "methadone_continue": false,
        "methadone_induction": false,
        "suboxone_induction": true,
        "acute_bh": false,
        "acute_med_stab": true,
        "takes_302": false,
        "dual_dx": true,
        "bh_med_init": true
      },
      "payer_summary": [
        {"payer_id": "MEDICAID", "in_network": true},
        {"payer_id": "BLUE", "in_network": false}
      ],
      "bed_status": {"status": "Waitlist", "last_updated": "2025-09-20T09:12:00Z"},
      "last_verified": "2025-09-20T13:45:00Z",
      "match_score": 78,
      "contact": {
        "name": "Intake Desk",
        "phone": "(555) 111-2222",
        "direct_address": "facility@direct.org",
        "fax": "(555) 111-3333"
      },
      "transfer_instructions": "Call intake, fax referral, confirm methadone take-home policy.",
      "capacity_estimate": "DetoxOnly",
      "notes": "ASAM 3.1 for adults only; no pregnancy transfers.",
      "metadata": {
        "source": "chronicles",
        "verified_by": "brad.id",
        "verified_method": "phone"
      }
    }
  ]
}
```

**Required fields per facility**: `facility_id`, `name`, `city`, `distance_miles` (nullable), `asam_levels`, `badges`, `payer_summary`, `bed_status`, `last_verified`, `match_score`, `contact`, `transfer_instructions`, `capacity_estimate`, `notes`, `metadata`.

---

## 4. Matching & Sorting Logic (server-side)
1. **Hard filters**: apply required constraints first (e.g., if patient `REQUIRES_302 = Y`, exclude facilities with `takes_302 = false` unless override flag supplied).
2. **Scoring rubric**:
   - ASAM match: exact +40, higher-level acceptable +20, lower-level -50.
   - MAT match: per matching MAT flag +20.
   - Acute BH / Acute Med Stab matches: +30 each when required.
   - Payer in-network: +10.
   - Recency: last_verified ≤7d +10; 8–14d +5; >30d -15.
   - Bed status: Open +10; Waitlist +0; Hold -10; Unknown -5.
3. **Sort order**: match_score desc → last_verified desc → distance asc.
4. Return top 25 by default; support pagination for infinite scroll.

---

## 5. Quick Actions & Side Effects
- **Call**: launches dialer/softphone stub; logs entry to Contact Planner (timestamp + facility).
- **Send packet**: opens Transfer SmartForm prefilled with SSOT data + facility contact; packet preview respects Act 148 / Part 2 gating.
- **Select**: runs validation/BPA. Confirm writes `SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID` and `_TS`. Warn/Block open modal requiring acknowledgement/override; Block needs reason and records `OVERRIDE_*` SDEs.
- **More**: reveals additional metadata (transfer instructions, verification notes, capacity).
- All quick actions produce an audit entry with user id, timestamp, action, payload for Privacy/HIM review.

---

## 6. Security & Privacy Requirements
- API secured via internal service token; accessible only from authorised Epic contexts.
- Directory edits limited to Directory Steward role; Finder read permitted broadly.
- SUD/toxicology indicators hidden unless user has role or has active Break-the-Glass session (which captures reason, TTL, supervisor flag, and alerts Privacy).
- Packet generation enforces Act 148 / Part 2 flags: redacts restricted fields and inserts statutory no-redisclosure language.

---

## 7. Performance & Reliability Targets
- Median response ≤500 ms; 95th percentile ≤2 s under normal load.
- Support ≥10 concurrent CRC users without breaching target latency.
- Short-lived caching (5–10 min) permitted; always display `last_verified` so staff can judge freshness.
- Graceful degradation: if operational directory unavailable, surface cached results plus banner: “Directory service unavailable — use manual call.”

---

## 8. Acceptance Criteria (QA)
1. Typical query returns top facilities ≤2 s, including patient ASAM/MAT matches.
2. ASAM filter (e.g., 3.1) restricts to facilities with matching ASAM flag; stale badges colour-coded correctly.
3. Selecting a hard-conflict facility triggers Block modal and prevents finalise until override captured.
4. Send packet prepopulates details and redacts Act 148 content when consent unavailable.
5. Call action logs attempt in Contact Planner.
6. No-results state displays guidance and alternative search options.
7. Audit log shows entries for Call, Send packet, Select, Override with user/time metadata.

---

## 9. Implementation Checklist (ticket-ready)
- [ ] Backend API `/api/facilities` with filters, scoring, pagination, auth.
- [ ] Operational directory source: Chronicles record type or sanctioned operational DB via Interconnect.
- [ ] Finder UI panel with search, filter chips, results cards, expand modal.
- [ ] Quick actions wired to Contact Planner, Transfer SmartForm, and audit logging.
- [ ] Validation/BPA modal handling for Confirm/Warn/Block + override reason capture.
- [ ] Staleness badges + Hide stale toggle.
- [ ] Act 148 / Part 2 consent checks integrated into packet preview.
- [ ] Performance testing meets latency benchmarks and failover messaging.
- [ ] QA executes acceptance criteria 1–7.

---

## 10. Example Layout (text wireframe)
```
[ Search  🔍 __________________________________ ] [Filters…]
Chips: [ASAM 3.1] [Methadone Continue] [Acute BH] [Hide stale ✓]

Westside Detox — Philadelphia (2.1 mi) — Match 87%
[ASAM:3.1] [Methadone:✓] [Suboxone:✗] [Acute BH:✗] [302:✗] [Dual Dx:✓] [Medicaid:✓] [Beds: Waitlist] [Verified: 9/20]
ASAM capacity: DetoxOnly. Transfer: Fax intake; meds-on-hand required.
Buttons: [Call] [Send packet] [Select] [More]
```

---

## 11. Next Available Artifacts
- API contract (JSON schema + examples).
- Seed facility CSV (20 rows) for prototype/testing.
- Prototype card mock-ups (compact/expanded/modal).

Let the build team specify which asset is needed first.
