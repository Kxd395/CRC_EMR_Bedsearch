Nice — here’s a ready-to-drop spec for the Patient List Preview with the changes you asked for: facility name when placed, show requested/required level-of-care when not yet placed, waiting-on-transport state, color coding, staff assignment, and how the UI + data model should behave.

Patient List Preview — updated spec

Columns (new order / names)
	•	Patient
	•	Placement — If placed: show Facility Name (primary); If not placed: show requested/required Level-of-Care (ASAM) tag (e.g. 3.7 WM, 3.5 COC, Acute-201, Acute-302, Dialysis, 302, 201)
	•	MAT — e.g., Methadone Continue, Suboxone Induction, No MAT need
	•	Status — single-word status + icon (see legend below)
	•	Transport — Waiting, Scheduled (ETA), Complete, Not required (with small icon)
	•	Assigned — staff name / role (click to message / reassign)
	•	Last Update — MM/DD hh:mm
	•	Reassess — Yes/No (or date if flagged)

⸻

Visual rules & color coding (row-level / badge-level)
	•	Row tint or left-edge indicator (choose one) plus compact status badge in the Status column:
	•	Accepted / Placed — Green (.plac-accepted) — badge: Accepted ✓ and facility name displayed under Placement.
	•	PendingReview / PacketSent / AwaitingResponse — Amber/Yellow (.plac-pending) — badge: Pending ⧗
	•	Waiting on Transport — Blue (.plac-waiting) — badge: Transport ⌛ (overrides Pending tint visually or adds a right-side ribbon)
	•	NoBeds — Gray (.plac-nobeds) — badge: No Beds ∅
	•	Denied — Red (.plac-denied) — badge: Denied ⨯
	•	Searching — Indigo/Light (.plac-searching) — badge: Searching …
	•	Canceled — Muted (.plac-canceled) — badge: Canceled
	•	Placement cell
	•	If Placed: display Facility Name (primary) with a small subline Unit / Bed if acceptance recorded, e.g.:
Hope Ridge Recovery
3.7 — Detox • Bed hold until 09/22 16:30
	•	If Not placed: display ASAM/LOC tag and any special flags: 3.7 WM • 302 req, 3.5 COC, Acute-302 etc.
	•	Transport cell
	•	Waiting — blue dot + “Waiting” (tooltip: who/when requested)
	•	Scheduled — blue with ETA (tooltip shows vendor and pickup)
	•	Complete — subtle green small check
	•	Not required — dash or “—”
	•	Assigned cell shows staff display name and role, e.g. Morgan Lee (CRC Tech); clickable to open quick-assignment menu.

⸻

Behavior / interactions
	•	Click Placement cell when Placed → open acceptance summary (accepting clinician, facility rep, transport, attachments).
	•	Click Placement when Not placed → quick open Finder modal pre-filtered by that ASAM + MAT + LOC.
	•	Click Status badge → open search(s) linked to that patient (all PLACEMENT_SEARCH rows).
	•	Click Transport → open transport plan (schedule, vendor, track).
	•	Hover Assigned → small popover with contact details and quick actions (message, reassign, add note).
	•	Keyboard: row focus / Enter opens quick summary; T on focused row opens transport modal.

⸻

Data mapping (SDEs & operational fields) — what this table reads/writes

Reads (to render row)
	•	SDE.CRC.RUNNOTE.PLACEMENT_STATUS (Searching | PendingReview | Accepted | Denied | NoBeds | Canceled)
	•	SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID (nullable)
	•	Facility.name (from directory) — displayed if PLACED
	•	SDE.CRC.RUNNOTE.ASAM_REQUESTED (e.g., 3.7) — displayed if not placed
	•	SDE.CRC.RUNNOTE.MAT_NEEDS — displayed in MAT column
	•	SDE.CRC.RUNNOTE.TRANSPORT_STATUS (None | Waiting | Scheduled | Complete)
	•	SDE.CRC.RUNNOTE.TRANSPORT_ETA / TRANSPORT_VENDOR / TRANSPORT_PICKUP_TS
	•	SDE.CRC.RUNNOTE.ASSIGNED_TO (user id) → lookup display name & role
	•	SDE.CRC.RUNNOTE.LAST_UPDATE_TS
	•	SDE.CRC.RUNNOTE.REASSESS_FLAG (Y/N or date)

Writes (on accept, assignment, transport update, reassess)
	•	On acceptance: write SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID, SDE.CRC.RUNNOTE.PLACEMENT_STATUS = Accepted, FACILITY_SELECTED_TS, SDE.CRC.RUNNOTE.ACCEPTED_BY_NAME, ACCEPTED_UNIT, ACCEPTED_BED_HOLD_UNTIL, SDE.CRC.RUNNOTE.TRANSPORT_MODE, PICKUP_TS, DESTINATION.
	•	On transport scheduling: update SDE.CRC.RUNNOTE.TRANSPORT_STATUS + TRANSPORT_ETA + vendor.
	•	On staff assignment: update SDE.CRC.RUNNOTE.ASSIGNED_TO.
	•	On reassess request: set SDE.CRC.RUNNOTE.REASSESS_FLAG = Y and REASSESS_DUE_TS.

⸻

Icons / CSS classes (developer handoff)
	•	Status classes:
	•	.plac-accepted → #ecfdf5 background / green border
	•	.plac-pending → #fffbeb background / amber border
	•	.plac-waiting → #e6f0ff background / blue accent
	•	.plac-nobeds → #f3f4f6 background / gray
	•	.plac-denied → #fef2f2 background / red accent
	•	Badge spacing: small left margin, icon before label.
	•	Small badges inside cells: .badge-small .icon { margin-right:6px }

⸻

Filters & quick-search chips for the Patient List
	•	Filter by Status: Accepted | Pending | WaitingTransport | NoBeds | Denied | Searching
	•	Filter by Assigned staff (dropdown)
	•	Filter by Level-of-Care (ASAM tags)
	•	Filter by Transport state (Waiting / Scheduled / Complete / Not required)
	•	Quick chip: Show only placed / Show only needing transport

⸻

Acceptance criteria (PRD-ready)
	1.	When a PLACEMENT_SEARCH row is set to Accepted, the Patient List shows Placement = Facility Name (green) and populates acceptance subline (unit/bed-hold/transport).
	2.	When not placed, Patient List shows ASAM tag (formatted; e.g., 3.7 WM, Acute-302).
	3.	Rows color-code per status using the classes above. Tooltips show last update + user.
	4.	Clicking Transport allows scheduling; updating transport status immediately updates the Transport cell and row tint to Waiting or Scheduled.
	5.	Assigned staff displays and is editable inline (or via right-click → assign); updates SDE.CRC.RUNNOTE.ASSIGNED_TO.
	6.	Reassess flag shows Yes and prevents Finalize if set (unless override recorded).
	7.	Filters return appropriate rows and counts update.

⸻

Tests (quick)
	•	T1: Accept facility for Jordan → Patient List shows Hope Ridge Recovery in Placement, row turns green; SSOT SDEs written.
	•	T2: Create search but no acceptance (ASAM 3.7) → Placement column shows 3.7 WM tag; status Pending amber.
	•	T3: Mark Waiting on Transport for a placed patient → Transport column shows Waiting, row shows blue ribbon; Finalize disabled until transport Complete (unless overridden with reason).
	•	T4: Reassign staff → Assigned updates; change logged in audit with timestamp.
	•	T5: New toxicology posts after acceptance → REASSESS_FLAG = Y, row shows Reassess: Yes, Finalize disabled, and user task created.

⸻

Example — updated Patient List (ASCII mock with your sample rows)

Patient            | Placement                        | MAT                 | Status        | Transport        | Assigned               | Last Update  | Reassess
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Rivera, Jordan     | Hope Ridge Recovery              | Methadone Continue  | Accepted ✓    | Not required     | Morgan Lee (CRC Tech)  | 09/22 08:58  | No
Gomez, Alicia      | City Stepdown — 3.1 (placed)     | Methadone Continue  | Pending ⧗     | Waiting (ETA 12:30)| Kevin Dial (CRS)   | 09/22 08:40  | No
Brooks, Tyler      | 3.7 WM                           | No MAT need         | Searching …   | Not required     | —                      | 09/22 07:05  | No
Chen, Mei          | 3.5 COC                          | Suboxone Induction  | Pending ⧗     | Scheduled (15:45) | Morgan Lee (CRC Tech)  | 09/22 07:55  | No
Wallace, Omar      | Acute-302                        | No MAT need         | No Beds ∅     | Not required     | Kevin Dial (CRS)       | 09/22 06:50  | No

Notes: Placement for placed rows is the facility name; when placed include unit/bed details under the facility. For not-placed patients the Placement column shows the requested LOC tag.

⸻

Implementation notes / developer tips
	•	Keep the Patient List component read from SSOT SDEs only; actions (accept, schedule transport, assign staff) call microservices that update the SDEs and the PLACEMENT_SEARCH operational table — then re-render.
	•	Use optimistic UI for assignment/transport changes but fail gracefully with toast + rollback on error.
	•	Audit: every status change, assignment, acceptance, or transport update must log {user, ts, action, details} to PLACEMENT_CONTACT_LOG or audit store.
	•	Performance: lazy-load detailed facility/transport info on hover or on-demand to keep list rendering fast for large units.

⸻

If you want, I’ll:
	•	produce a small CSV seed with these extra fields (accepted_by, transport_status, assigned_to) and sample values for import, or
	•	generate a working React table prototype (with color classes, inline assign, and transport modal) you can drop into the prototype ZIP.

Which of those next steps do you want? Confidence: 96%