# 17_Page_SSOT_and_Layout — CRC SSOT / Facility Finder
**Date:** 2025-09-23 13:28 UTC  
**Purpose:** Single, authoritative (SSOT) spec for the Running Note page with mapping (data ↔ UI), flow, functions, breadcrumbs, logic, and layout rules. Includes *Patients on Unit / My Assigned Patients*, and **Active Placement Searches pinned by default**.

---

## 0) Page purpose (one line)
Provide a **single, authoritative (SSOT)** workspace where CRC staff can: review the current assessment, run & manage facility searches, record acceptances and transport, and see **unit‑wide + assigned** patient status—without losing context on refresh.

---

## 1) Breadcrumbs & route model (navigation SSOT)
**Canonical route:**
```
CRC Home  ›  Unit: {UNIT_NAME}  ›  Patient: {LAST, FIRST} (MRN {MRN} • Visit {VISIT_ID})  ›  Tab: {Running Note | Facility Finder | Tasks & Approvals | Activity Log}
```

**IDs & parameters (must be available before queries fire):**
- `unitId` (required for unit lists)
- `visitId` (required for visit-level SSOT and searches)
- `patientId` (for cross-links; visitId remains the visit key)
- `tab` (string; default `running-note`)

**Breadcrumb behavior:**
- Clicking **Unit** returns to the Unit board (Patients on Unit).
- Clicking **Patient** opens a **patient scenario chooser** (see §4), defaulting to *your* assigned patients at the top, then everyone else on the unit in alpha order.

> **Rule:** All data-fetching hooks enable on **presence of IDs** (not on “has data”), to avoid “empty until you add one” after refresh.

---

## 2) SSOT data model (what this page reads/writes)

**Visit‑level SDEs (SSOT) — read on every render**
- `SDE.CRC.RUNNOTE.ASAM_REQUESTED`
- `SDE.CRC.RUNNOTE.MAT_NEEDS`
- `SDE.CRC.RUNNOTE.MEDICAL_ACUITY_REQUIRED`
- `SDE.CRC.RUNNOTE.PLACEMENT_NEEDED` (Y/N)
- `SDE.CRC.RUNNOTE.PLACEMENT_STATUS` *(Searching | PendingReview | Accepted | Denied | NoBeds | Canceled)*
- `SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID`, `FACILITY_SELECTED_TS`
- `SDE.CRC.RUNNOTE.ACCEPTED_BY_NAME`, `ACCEPTED_BY_ROLE`, `ACCEPTED_UNIT`, `ACCEPTED_BED_HOLD_UNTIL`
- `SDE.CRC.RUNNOTE.TRANSPORT_STATUS` *(None | Waiting | Scheduled | Complete)*, `TRANSPORT_MODE`, `TRANSPORT_ETA`, `PICKUP_TS`, `DESTINATION`
- `SDE.CRC.RUNNOTE.ASSIGNED_TO` (userId) + display
- `SDE.CRC.RUNNOTE.REASSESS_FLAG` (Y/N or date)
- `SDE.CRC.RUNNOTE.SEARCH_COUNT`, `SEARCH_LAST_TS`, `SEARCH_STATUS`, `PACKET_PRINTED_LAST_TS`

**Operational entities (Chronicles/DB)**
- `PLACEMENT_SEARCH` (one row **per facility**)  — status, channels, documents, accepted_*, transport_*, `bulk_create_id`, timestamps, creator.
- `PLACEMENT_CONTACT_LOG` (attempts & outcomes per search)
- `FACILITY_DIRECTORY` (capabilities: ASAM, BH, 302, MAT, payer)
- `USER_PREFERENCES` (layout and panel visibility; see §7)

---

## 3) Panels (inventory) & default visibility

**Panels in Running Note tab:**
1. **Assessment Overview** (SSOT snapshot) — *always visible*.
2. **Quick Update** (SSOT edits) — *always visible*.
3. **Active Placement Searches** — **pinned by default** *(must be visible on every load unless user hides in settings)*.
4. **Contact Planner** (call attempts & quick actions) — visible.
5. **Patient List Preview** — with **All Patients on Unit** and **My Assigned** views (see §5).
6. **Recent Placement Searches** (condensed log) — visible.
7. Right‑rail: **Workflow Timeline**, **Directory Steward Console**, **Audit & Privacy** — visible.

**Settings default:** `Active Placement Searches.visible = true` and **locked** for the CRC role (user may collapse, but cannot hide unless role admin allows).

> **Empty states:** Panels always render with skeletons/empty states—**never** gated on “has data”.

---

## 4) Patient scenario chooser (top of page)
**Control:** a split button next to the patient banner:
- `Patients on Unit` ▾
- Right side: a **combo search** box that searches *your patients first*, then all on unit.

**Sort & highlight:**
- **My assigned** appear on top; tinted row background or left accent bar (blue).
- Rest of unit follows (alphabetical), separated by a divider.

**Keyboard:**
- `/` focuses search; ↑/↓ navigate; Enter switches patient (per visitId).

**On switch:**
- Replace `visitId` in route; **re-run queries** for SSOT + searches; keep panel layout intact.

---

## 5) Patient List Preview (updated)
**Toggle chips above the table:**
- **All Patients** (unit scope) | **Placed Only** | **Need Transport**
- **My Patients** (quick filter; places *my* assigned at top and highlights them)

**Columns:**
- Patient | **Placement** *(facility if Accepted; otherwise LOC tag such as `3.7 WM`, `3.5 COC`, `Acute‑302`, `201`)* | MAT | Status | Transport | Assigned | Last Update | Reassess

**Color rules & interactions:**
- Accepted = green; Pending/Sent = yellow; Denied = red; NoBeds = gray; Searching = indigo.
- Click Placement → acceptance summary (if placed) or Finder modal (if not).
- Click Status → opens **Active Placement Searches** scoped to patient.
- Click Transport → transport modal (schedule/complete).
- Click Assigned → reassign.

---

## 6) Active Placement Searches (behavior & logic)
- **Always present** (sticky card); **visible on first render**.
- **Filters:** All / Searching / Pending / Accepted / Denied + facility + channel.
- One card per `PLACEMENT_SEARCH` (status-tinted).
- Actions: Edit · Verify · Send packet · **Record acceptance** · Mark denied · No beds · Cancel.

**Core logic:**
- **Multi‑Add** → **one row per facility** with shared `bulk_create_id`.
- **Record acceptance** → writes `Accepted` metadata, updates SSOT Selected Facility, offers “Cancel other open rows”.
- Denial/NoBeds → require reason; NoBeds proposes recheck time + reminder task.

**Refresh model:**
- On mount: fetch history with `include_history=true`.
- After any action: invalidate `['searches', visitId]` and `['patientList', unitId]`.
- Never gate queries on “has data”.

---

## 7) User settings (what to show)
**Persisted key:** `crc.layout.v1` in `USER_PREFERENCES`.

Example (default CRC role):
```json
{
  "layout": {
    "panels": {
      "activeSearches": { "visible": true, "collapsed": false, "locked": true, "col": "center", "order": 1 },
      "runningNote":    { "visible": true, "collapsed": false,               "col": "left",   "order": 1 },
      "contactPlanner": { "visible": true, "collapsed": false,               "col": "left",   "order": 2 },
      "patientList":    { "visible": true, "collapsed": false,               "col": "right",  "order": 1 },
      "workflow":       { "visible": true, "collapsed": false,               "col": "right",  "order": 2 },
      "steward":        { "visible": true, "collapsed": true,                "col": "right",  "order": 3 },
      "audit":          { "visible": true, "collapsed": true,                "col": "right",  "order": 4 }
    }
  }
}
```

- **Active Placement Searches** can be collapsed but **not hidden** for CRC role unless an admin preset turns off `locked`.

---

## 8) Page flow (happy path)
1) Assessment auto‑pulls (LOC/ASAM, MAT, acuity, 302) → SSOT snapshot renders.
2) **Add Search** → creates `PLACEMENT_SEARCH` rows (per facility).
3) **Verify** (rules engine) → Confirm/Warn/Block.
4) **Send packets** → status `PacketSent` (yellow).
5) Facility accepts or denies:
   - On **Record acceptance**: SSOT writes Selected Facility, unit, bed‑hold, transport, etc. Patient List row turns **green**; “Finalize transfer” is gated by reassess/transport.
6) **Transport scheduled** → Transport shows Waiting/Scheduled; finalize only when Complete (or override with reason).
7) **Finalize transfer** → writes completion; cancels other open searches automatically (with audit).

**Safety gates:**
- Reassess flag (new tox) blocks finalize until review/override.
- 302 requires secure transport before finalize.
- Out‑of‑network acceptance requires attested reason.

---

## 9) API & query rules (prevent refresh bugs)
- `GET /visits/{visitId}/placement/searches?include_history=true` — **always** on mount when `visitId` exists.
- `GET /units/{unitId}/patient-list?scope=all&filters={...}` — on mount when `unitId` exists.
- Gate queries only on presence of IDs.
- On create/update/accept/deny/transport: invalidate `['searches', visitId]` & `['patientList', unitId]`.
- Default Patient List filters: `scope=all`, `status=any`, `assignedTo=any` (not “mine only”).

---

## 10) What’s missing (recommended)
- Scenario strip at the top (quick switch among *My Patients* vs *All* with search box, keyboard `/`).
- Bed‑hold timer badge with auto‑reminder.
- Global alerts puck (Reassess required; Aging searches >4h) even if panels are collapsed.
- Persist unit filters per user (localStorage fallback).
- Export acceptance summary PDF appended to packet set.
- Assignment SLAs (rows highlight when unassigned > X mins).
- Verify/Send idempotency keys + debounce.

---

## 11) Acceptance criteria
- **AC‑1 (visibility):** On first load, **Active Placement Searches** is visible with history (or empty state).  
- **AC‑2 (patient lists):** Patient List shows **All patients** by default; **My Patients** pins & tints assigned rows.  
- **AC‑3 (scenario chooser):** Switching patients rehydrates SSOT/searches without losing layout.  
- **AC‑4 (refresh):** Refresh retains panel visibility and filters (persisted).  
- **AC‑5 (color/status):** Canonical palette applied (Accepted green; Pending/Sent yellow; Denied red; NoBeds gray; Searching indigo).  
- **AC‑6 (safety):** Reassess and 302 transport policies block Finalize unless override with attestation.  
- **AC‑7 (audit):** All search actions, overrides, acceptance write audit events with `{user, ts, action, details}`.

---

## 12) Test checklist
- **T1:** Refresh → Active Searches visible & populated; Patient List renders All patients.
- **T2:** Toggle **My Patients** → assigned rows pin to top and tint.
- **T3:** Multi‑Add 3 facilities → 3 search rows appear; persist on refresh.
- **T4:** Record acceptance → SSOT updates; Patient List Placement shows facility; row green.
- **T5:** Schedule transport → Transport shows Waiting/Scheduled; finalize gated.
- **T6:** New tox after acceptance → Reassess = Yes; Finalize disabled until resolved.
- **T7:** Hide Active Searches via settings (if not locked) → panel disappears; Reset defaults restores it.
