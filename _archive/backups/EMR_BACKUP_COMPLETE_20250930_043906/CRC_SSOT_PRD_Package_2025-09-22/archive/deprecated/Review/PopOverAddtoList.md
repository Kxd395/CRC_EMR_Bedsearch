CRC Placement Search Popover + Button Placement Spec (Minimal & Expanded)

Purpose: Copy/paste-ready content for the build ticket. The Minimal pop-over assumes the EMR has already auto-pulled assessment data and only exposes what must be editable. The Expanded pop-over adds bulk ops, per-facility channels, packet picks, and next-step scheduling. Includes when/where to surface the Add Search button.

⸻

MINIMAL POPOVER — “Add / Edit Placement Search”

┌─────────────────────────────────────────────────────────────────────────────┐
│  Add / Edit Placement Search                                                │
│  (SSOT pop-over — assumes assessment data already pulled)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Facility (multi-select)                                                     │
│ [ ▼ Select facilities … ]  ⊕ Add other…                                     │
│  • Selected: [ Hope Ridge Recovery ] [ Riverview Detox ]  [ + ]             │
│                                                                             │
│ Quick capability toggles (optional overrides; default from directory)       │
│ [ ] Takes 302     [ ] Acute Med Stab     [ ] Acute BH     [ ] Secure BH     │
│ [ ] Dual Dx       [ ] BH Med Init        [ ] In-Network*                     │
│ *In-Network is read-only if payer lookup is wired; allow override w/ reason  │
│                                                                             │
│ Send channels (applies to all selected)                                     │
│ [x] Fax     [ ] Secure Email (Direct)     [ ] EMR Clinicals                  │
│                                                                             │
│ Short transfer notes (140 chars)                                            │
│ [ Enter a brief placement note…                                         ]   │
│                                                                             │
│ Actions                                                                     │
│ [ Verify ]   [ Publish to SSOT ]   [ Cancel ]                               │
│                                                                             │
│ Audit capture (auto)                                                        │
│ User: ${current_user}   Time: ${now}   BTG: {Active/Not required}            │
│ On Publish → write: searches + channels + packet default + SSOT roll-ups    │
└─────────────────────────────────────────────────────────────────────────────┘

Field → Build mapping (minimal)
	•	UI.FACILITY_MULTISELECT → create 1..N PLACEMENT_SEARCH rows (operational).
	•	UI.QUICK_TOGGLES.* → optional override flags on the PLACEMENT_SEARCH (persist reason if differing from directory).
	•	UI.CHANNELS → PLACEMENT_SEARCH.channels (Fax | DirectEmail | EMR_Exchange).
	•	UI.NOTES → PLACEMENT_SEARCH.notes.
	•	On Publish also update SSOT roll-ups:
	•	SDE.CRC.RUNNOTE.SEARCH_COUNT, SDE.CRC.RUNNOTE.SEARCH_LAST_TS, SDE.CRC.RUNNOTE.SEARCH_STATUS.

Default packet (minimal)
	•	CoreSummary, ASAM, Meds, LastDose, Vitals24h, LabsNonSensitive, Demographics.
SUD/HIV, 302 docs auto-excluded unless policy/ROI/BTG allows.

Button logic (minimal)
	•	Verify → run Confirm/Warn/Block checks (ASAM/MAT/302/BH/acuity/in-network).
	•	Publish to SSOT → if Confirm or Warn (or Block with attested override) then: create PLACEMENT_SEARCH rows + write roll-ups + audit {user, ts, facilities[], channels[], packet_hash_default}.

⸻

EXPANDED POPOVER — “Add / Edit Placement Searches (Bulk)”

┌───────────────────────────────────────────────────────────────────────────────┐
│  Add / Edit Placement Searches (Bulk)                                         │
├───────────────────────────────────────────────────────────────────────────────┤
│ Facilities                                                                    │
│ [ ▼ Select facilities … ]  ⊕ Add other…     (type-ahead; multi-select)        │
│ Selected: [ Hope Ridge Recovery ] [ Riverview Detox ] [ City Acute BH ]       │
│ [ Apply to all ] Channels: [x] Fax [ ] Email [ ] EMR   Packets: [x] Standard  │
│                                                                               │
│ Per-facility channels & endpoints                                             │
│ Hope Ridge Recovery          Fax: 215-555-0199   Email: intake@…   EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│ Riverview Detox              Fax: 267-555-0114   Email: —          EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│ City Acute BH                Fax: 215-555-0102   Email: —          EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│                                                                               │
│ Quick capability toggles (applies to selection; can override per row)         │
│ [ ] Takes 302  [ ] Acute Med Stab  [ ] Acute BH  [ ] Secure BH  [ ] Dual Dx   │
│ [ ] BH Med Init  [ ] In-Network*   Override reason: [……………]                   │
│                                                                               │
│ Packet set (click to expand)                                                  │
│ [ ▸ ] Standard packet (Core, ASAM, Meds, LastDose, Vitals, Labs-Non-sens, Demo)│
│ [ ▾ ] Custom: [ ] SUD Labs*  [ ] 302 Docs*  [ ] ROI Forms*  [ ] Cover Sheet    │
│   *disabled unless ROI/BTG satisfied (show tooltip with policy text)          │
│                                                                               │
│ Next steps                                                                    │
│ Next action: ( CallBack | SendPacket | RecheckBeds | Escalate | None )        │
│ Next at: [ 11:00 ]   Assign task to: [ CRC Placement Pool ▼ ]                 │
│                                                                               │
│ Controls                                                                      │
│ [ Verify ]   [ Generate packets ]   [ Send now ]   [ Print packets ]  [ Cancel]│
│                                                                               │
│ Footer / Audit                                                                │
│ Bulk ID: {BULK-yyyy-mm-dd-hhmm}   User: ${current_user}   Time: ${now}         │
│ On actions → write audit per search (user, ts, channels, docs, packet_hash)   │
└───────────────────────────────────────────────────────────────────────────────┘

Field → Build mapping (expanded)
	•	Multi-select + “Add other” → PLACEMENT_SEARCH rows with bulk_create_id.
	•	Per-row Channels/Endpoints → PLACEMENT_SEARCH.channels + channel_endpoints{fax_number, direct_address, emr_site_id}.
	•	Per-row Docs picker → PLACEMENT_SEARCH.documents[].
	•	Per-row Notes → PLACEMENT_SEARCH.notes.
	•	Next action/at + Assign task → create In Basket task; store PLACEMENT_SEARCH.next_action/next_at.
	•	Generate/Print → produce per-facility bundle; store printed_pdf_id, packet_hash.
	•	Send now → enqueue to fax/email/EMR; append to PLACEMENT_CONTACT_LOG with {action: PacketSent, outcome_status}.
	•	SSOT roll-ups on Publish/Send/Print:
	•	SDE.CRC.RUNNOTE.SEARCH_COUNT, SEARCH_LAST_TS, SEARCH_STATUS, PACKET_PRINTED_LAST_TS.

Default packet + gating (expanded)
	•	Standard set = CoreSummary, ASAM, Meds, LastDose, Vitals24h, LabsNonSensitive, Demographics.
	•	Gated adds = LabsSUD, 302 Docs, ROI Forms only if ROI/BTG. Show policy tooltip; require attestation if override.

Button logic (expanded)
	•	Verify → run Confirm/Warn/Block per facility; highlight rows needing override (ASAM/MAT/302/BH).
	•	Generate packets → create PDFs & hashes (no send).
	•	Send now → push to channel queues; update status to PacketSent.
	•	Print packets → open print dialog; record printed_pdf_id.
	•	Publish (optional) → persist searches + SSOT roll-ups even if not sending yet.

⸻

Minimal field list (explicit)
	•	Facility dropdown: multi-select, type-ahead, Add other…
	•	Notes: short transfer note (140 chars)
	•	Quick toggles: Takes 302, Acute Med Stab, Acute BH, Secure BH, Dual Dx, BH Med Init, In-Network (read-only or override with reason)
	•	Verify / Publish buttons + audit capture

⸻

IDs to hand the builders (PRD v2-consistent)
	•	UI: UI.FACILITY_MULTISELECT, UI.QUICK_TOGGLES.*, UI.CHANNELS.*, UI.NOTES, UI.ACTION_VERIFY, UI.ACTION_PUBLISH
	•	SDE roll-ups: SDE.CRC.RUNNOTE.SEARCH_COUNT, SEARCH_LAST_TS, SEARCH_STATUS, PACKET_PRINTED_LAST_TS
	•	Operational tables: PLACEMENT_SEARCH, PLACEMENT_CONTACT_LOG

⸻

“Add Search” button — activation rules & placement

When active

Always visible, but enabled only if:
	1.	ASAM/LOC present for the current visit, and
	2.	PlacementNeeded = Yes, and
	3.	MAT_Needs selected (Unknown allowed → soft warning on Verify), and
	4.	Part-2 gating satisfied if SUD/HIV materials would be included (BTG/ROI state OK).

Disabled tooltip:
“Complete LOC/ASAM, set Placement Needed = Yes, and select MAT before adding searches.”

Where to place it

A) Recommended (Primary) — SSOT card header

┌──────────────────────────────────────────────────────────────────────────────┐
│ CRC Unit Running Note (SSOT)                                      [Help ⓘ]  │
│ ──────────────────────────────────────────────────────────────────────────── │
│ [Add Search ▾]  [Add Multiple]  [Paste List]     [View Transfer Packet]     │
│                                                                              │
│  Assessment Overview   |   Quick Update   |   (other fields…)                │
└──────────────────────────────────────────────────────────────────────────────┘

Lives with the SSOT and matches the mental model “this note controls placement.”

B) Alternate (Secondary) — Quick Update footer

Quick Update
┌──────────────────────────────────────────────────────────────────────────────┐
│  … (PlacementNeeded, MAT_Needs, short note)                                  │
│                                                                              │
│ [Save Quick Update]   [Add Search ▾]   [View Transfer Packet]   [Sim tox]    │
└──────────────────────────────────────────────────────────────────────────────┘

C) Global sticky action bar — under patient banner

Patient banner / Storyboard
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Add Search ▾]  [Send Now]  [Print Packets]  [Open Finder]    (Esc to close) │
└──────────────────────────────────────────────────────────────────────────────┘
Main content (Tabs: Running Note | Facility Finder | Tasks & Approvals | …)

Minimal button group (labels)
	•	Add Search ▾ (opens minimal popover)
	•	Add Search (single)
	•	Add Multiple…
	•	Paste List…
	•	View Transfer Packet (existing)
	•	(Optional) Send Now / Print Packets (global bar)

Keyboard & focus
	•	Shortcut: ⌥A (Alt+A) opens from any placement.
	•	Focus lands on facility field; Esc closes; button uses aria-disabled when prerequisites aren’t met.

One-line rule text (for ticket)

Render Add Search in SSOT header (primary) and Quick Update footer (secondary). Always visible; enabled when LOC/ASAM present and PlacementNeeded = Yes and MAT_Needs set; Part-2 gating enforced for SUD/HIV. Same handler opens the minimal popover.
Perfect—here’s a build‑ticket–ready pack that drops your spec straight into an Epic/Jira ticket and fills the missing developer bits (data model, verify logic, permissions, strings, acceptance tests). I kept your ASCII popovers intact and tightened labels where useful.

⸻

Ticket: CRC Placement Search Popover + Button Placement (Minimal & Expanded)

Owner: Kevin J. Dial
Build Areas: ED/CRC Navigator, SmartForms (SSOT), UI component (Popover), BPA/Rules, In Basket, Operational Store/API
Privacy: Act 148 + 42 CFR Part 2 gating respected; Break‑the‑Glass (BTG) audited
Summary: Add a patient‑aware Placement Search popover (single and bulk) that records which facilities were contacted, through which channels, with what default packet, and writes minimal roll‑ups into the CRC SSOT. EMR already pulls assessment data (ASAM/MAT/302/acuity), so the popover exposes only what must be editable.

⸻

MINIMAL POPOVER — “Add / Edit Placement Search”

(copy/paste into ticket)

┌─────────────────────────────────────────────────────────────────────────────┐
│  Add / Edit Placement Search                                                │
│  (SSOT pop-over — assumes assessment data already pulled)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Facility (multi-select)                                                     │
│ [ ▼ Select facilities … ]  ⊕ Add other…                                     │
│  • Selected: [ Hope Ridge Recovery ] [ Riverview Detox ]  [ + ]             │
│                                                                             │
│ Quick capability toggles (optional overrides; default from directory)       │
│ [ ] Takes 302     [ ] Acute Med Stab     [ ] Acute BH     [ ] Secure BH     │
│ [ ] Dual Dx       [ ] BH Med Init        [ ] In-Network*                     │
│ *In-Network is read-only if payer lookup is wired; allow override w/ reason  │
│                                                                             │
│ Send channels (applies to all selected)                                     │
│ [x] Fax     [ ] Secure Email (Direct)     [ ] EMR Clinicals                  │
│                                                                             │
│ Short transfer notes (140 chars)                                            │
│ [ Enter a brief placement note…                                         ]   │
│                                                                             │
│ Actions                                                                     │
│ [ Verify ]   [ Publish to SSOT ]   [ Cancel ]                               │
│                                                                             │
│ Audit capture (auto)                                                        │
│ User: ${current_user}   Time: ${now}   BTG: {Active/Not required}            │
│ On Publish → write: searches + channels + packet default + SSOT roll-ups    │
└─────────────────────────────────────────────────────────────────────────────┘

Field → Build mapping (minimal)
	•	UI.FACILITY_MULTISELECT → create 1..N PLACEMENT_SEARCH rows (operational store).
	•	UI.QUICK_TOGGLES.* → optional override flags on PLACEMENT_SEARCH; if any differ from directory, persist override_reason.
	•	UI.CHANNELS → PLACEMENT_SEARCH.channels (Fax | DirectEmail | EMR_Exchange).
	•	UI.NOTES → PLACEMENT_SEARCH.notes.
	•	On Publish, also update SSOT roll‑ups:
	•	SDE.CRC.RUNNOTE.SEARCH_COUNT
	•	SDE.CRC.RUNNOTE.SEARCH_LAST_TS
	•	SDE.CRC.RUNNOTE.SEARCH_STATUS (e.g., Draft | Published | Sent)

Default packet (minimal)
	•	Included: CoreSummary, ASAM, Meds, LastDose, Vitals24h, Labs‑NonSensitive, Demographics.
	•	Excluded by default: SUD/HIV, 302 docs, ROI forms unless consent/BTG/policy allows (Act 148/Part 2). Packet selection is implicit in “Publish to SSOT”.

Button logic (minimal)
	•	Verify → run Confirm/Warn/Block checks (ASAM/MAT/302/BH/acuity/network).
	•	Publish to SSOT → if Confirm or Warn (or Block with attested override), create PLACEMENT_SEARCH rows, write roll‑ups, log audit {user, ts, facilities[], channels[], packet_hash_default}.

⸻

EXPANDED POPOVER — “Add / Edit Placement Searches (Bulk)”

(copy/paste into ticket)

┌───────────────────────────────────────────────────────────────────────────────┐
│  Add / Edit Placement Searches (Bulk)                                         │
├───────────────────────────────────────────────────────────────────────────────┤
│ Facilities                                                                    │
│ [ ▼ Select facilities … ]  ⊕ Add other…     (type-ahead; multi-select)        │
│ Selected: [ Hope Ridge Recovery ] [ Riverview Detox ] [ City Acute BH ]       │
│ [ Apply to all ] Channels: [x] Fax [ ] Email [ ] EMR   Packets: [x] Standard  │
│                                                                               │
│ Per-facility channels & endpoints                                             │
│ Hope Ridge Recovery          Fax: 215-555-0199   Email: intake@…   EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│ Riverview Detox              Fax: 267-555-0114   Email: —          EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│ City Acute BH                Fax: 215-555-0102   Email: —          EMR: —      │
│  [x] Fax  [ ] Email  [ ] EMR      Docs: [Standard ▼]  Notes: [………..]          │
│                                                                               │
│ Quick capability toggles (applies to selection; can override per row)         │
│ [ ] Takes 302  [ ] Acute Med Stab  [ ] Acute BH  [ ] Secure BH  [ ] Dual Dx   │
│ [ ] BH Med Init  [ ] In-Network*   Override reason: [……………]                   │
│                                                                               │
│ Packet set (click to expand)                                                  │
│ [ ▸ ] Standard packet (Core, ASAM, Meds, LastDose, Vitals, Labs-Non-sens, Demo)│
│ [ ▾ ] Custom: [ ] SUD Labs*  [ ] 302 Docs*  [ ] ROI Forms*  [ ] Cover Sheet    │
│   *disabled unless ROI/BTG satisfied (show tooltip with policy text)          │
│                                                                               │
│ Next steps                                                                    │
│ Next action: ( CallBack | SendPacket | RecheckBeds | Escalate | None )        │
│ Next at: [ 11:00 ]   Assign task to: [ CRC Placement Pool ▼ ]                 │
│                                                                               │
│ Controls                                                                      │
│ [ Verify ]   [ Generate packets ]   [ Send now ]   [ Print packets ]  [ Cancel]│
│                                                                               │
│ Footer / Audit                                                                │
│ Bulk ID: {BULK-yyyy-mm-dd-hhmm}   User: ${current_user}   Time: ${now}         │
│ On actions → write audit per search (user, ts, channels, docs, packet_hash)   │
└───────────────────────────────────────────────────────────────────────────────┘

Field → Build mapping (expanded)
	•	Multi‑select/“Add other” → PLACEMENT_SEARCH rows with bulk_create_id.
	•	Per‑row Channels/Endpoints → channels + channel_endpoints{fax, direct_address, emr_site_id}.
	•	Per‑row Docs picker → documents[].
	•	Per‑row Notes → notes.
	•	Next step → create In Basket task; persist next_action, next_at, assigned_pool_id.
	•	Generate/Print → produce PDFs; store printed_pdf_id, packet_hash.
	•	Send now → enqueue to fax/email/EMR; write PLACEMENT_CONTACT_LOG {action: PacketSent, outcome}.
	•	SSOT roll‑ups on Publish/Send/Print: SEARCH_COUNT, SEARCH_LAST_TS, SEARCH_STATUS, PACKET_PRINTED_LAST_TS.

⸻

“Add Search” button — activation & placement

Enable when:
	1.	ASAM/LOC present on current visit; 2) PlacementNeeded = Yes; 3) MAT_Needs set (Unknown allowed → warn on Verify); 4) Part‑2 gating ok if packet includes SUD/HIV (BTG/ROI state valid).

Disabled tooltip: “Complete LOC/ASAM, set Placement Needed = Yes, and select MAT before adding searches.”

Where:
	•	Primary: SSOT card header (top‑left) — [Add Search ▾] + [Add Multiple] + [Paste List].
	•	Secondary: Quick Update footer — next to “Save Quick Update”.
	•	Global bar: optional sticky action row under patient banner (Add/Search/Send/Print).

Keyboard: Alt + A to open popover. Focus lands on Facility field; Esc closes.

⸻

Verify rule (Confirm / Warn / Block) — pseudocode

(server‑side rule; same logic used by “Verify” and on Select/Send)

inputs: patient.asam, patient.mat, patient.requires_302, patient.behavioral_acuity,
        patient.medical_acuity, payer.in_network, consent/BTG flags,
        facility.asam_levels[], facility.methadone/suboxone flags,
        facility.takes_302, facility.acute_bh, facility.secure_bh,
        facility.acute_med_stab, facility.medical_acuity_capability

if patient.requires_302 and not facility.takes_302 -> BLOCK(reason="302Mismatch")
if patient.behavioral_acuity == "Secure" and not facility.secure_bh -> BLOCK("BH Secure required")
if patient.behavioral_acuity == "Acute" and not facility.acute_bh -> BLOCK("BH Acute required")

asam_ok = patient.asam in facility.asam_levels
if not asam_ok:
    if exists lvl in facility.asam_levels where lvl > patient.asam:
        WARN("HigherLevelAvailable")
    else:
        BLOCK("FacilityDoesNotSupportASAM")

mat_ok = (patient.mat == "MethadoneContinue" -> facility.methadone_continue) AND
         (patient.mat == "MethadoneInduction" -> facility.methadone_induction) AND
         (patient.mat == "SuboxoneContinue"  -> facility.suboxone_continue) AND
         (patient.mat == "SuboxoneInduction" -> facility.suboxone_induction)
if patient.mat != "None" and not mat_ok -> BLOCK("MATMismatch")

acuity_ok = patient.medical_acuity <= facility.medical_acuity_capability or facility.acute_med_stab
if not acuity_ok -> WARN("MedicalAcuityConcern")

if packet includes SUD/HIV and consent/BTG not valid -> BLOCK("Consent/Part2 gating")

network_warn = (payer.in_network == false) ? WARN("OutOfNetwork") : pass

=> outcome: HIGHEST(blocks) else warn else confirm

Override: If a Block is overridden, require override_reason (min 10 chars), capture override_user_id, and write an audit entry. Finalize still subject to consent gating.

⸻

Data model (operational store) — table stubs

(Chronicles or sanctioned operational DB via Interconnect; mirror to Clarity for analytics only)

PLACEMENT_SEARCH
	•	id (pk), bulk_create_id (nullable)
	•	mrn, visit_id
	•	facility_id, facility_name (for provisional)
	•	channels (array: fax|direct_email|emr)
	•	channel_endpoints (json: fax_number, direct_address, emr_site_id)
	•	override_flags (json: takes_302, acute_med_stab, acute_bh, secure_bh, dual_dx, bh_med_init, in_network, override_reason)
	•	documents (array: Standard, SUDLabs, 302Docs, ROIs, Cover)
	•	notes (short text, 140)
	•	status (Draft|Published|PacketGenerated|PacketSent|Closed)
	•	packet_hash (sha256), printed_pdf_id
	•	next_action (enum), next_at (ts), assigned_pool_id
	•	created_by, created_ts, updated_by, updated_ts

PLACEMENT_CONTACT_LOG
	•	id (pk), placement_search_id (fk)
	•	event_ts, user_id, action (CallAttempt|PacketSent|PacketFailed|Verified|Printed)
	•	channel (fax|direct_email|emr), outcome_status (Success|Busy|NoAnswer|Fail), details (text)

SSOT roll‑ups (SDEs)
	•	SDE.CRC.RUNNOTE.SEARCH_COUNT (int)
	•	SDE.CRC.RUNNOTE.SEARCH_LAST_TS (ts)
	•	SDE.CRC.RUNNOTE.SEARCH_STATUS (enum)
	•	SDE.CRC.RUNNOTE.PACKET_PRINTED_LAST_TS (ts)

⸻

Security, privacy, and audit
	•	Part 2/Act 148 gating: SUD/HIV content never included unless consent/BTG meets policy; popover shows gated options disabled with tooltip text.
	•	Roles:
	•	All CRC roles can Add Search and Publish to SSOT.
	•	Directory Steward can edit directory flags and use Verify now.
	•	Override (on Blocks) limited to designated clinical roles; requires attestation + reason.
	•	Audit: All Publish/Send/Verify/Override actions log {user_id, role, ts, changed_fields, facilities[], channels[], packet_hash, override_reason} and are reportable to Privacy/HIM.

⸻

Strings & tooltips (copy)
	•	Disabled Add Search: “Complete LOC/ASAM, set Placement Needed = Yes, and select MAT before adding searches.”
	•	Gated docs tooltip: “This document requires consent or Break‑the‑Glass under Act 148 / 42 CFR Part 2.”
	•	Warn (Higher level): “This facility supports a higher ASAM level than requested. Continue or choose an alternative.”
	•	Block (302): “This facility does not accept 302 admissions. Choose another or request an override.”

⸻

Acceptance criteria (QA)
	1.	Enablement: Add Search button enables only when LOC/ASAM present + PlacementNeeded=Yes + MAT_Needs set.
	2.	Minimal publish: Publishing creates one PLACEMENT_SEARCH row per selected facility and updates SSOT roll‑ups.
	3.	Verify outcomes: Confirm/Warn/Block reflects patient ASAM/MAT/302/BH/acuity and facility attributes; Block requires override + audit.
	4.	Gating: SUD/HIV/302 docs remain disabled unless consent/BTG satisfied; attempting to include without gating returns a Block.
	5.	Channels: Choosing Fax|Direct|EMR correctly maps to endpoints; “Send now” creates Contact Log entries with outcomes.
	6.	Notes & limits: Transfer note limited to 140 chars; over‑limit blocks Publish with inline error.
	7.	Bulk ops: Expanded popover creates one row per facility with bulk_create_id; Generate/Print/Send update status and logs.
	8.	Performance: Popover opens <300ms; Verify returns <2s with directory of expected size.
	9.	Audit: All actions visible in audit view with changed_fields diffs and packet hashes.

⸻

Developer payloads (examples)

Minimal “Publish to SSOT”

{
  "action":"publish",
  "patient":{"mrn":"1234567","visit_id":"V1000456"},
  "facilities":[
    {"facility_id":"WSD-001"},
    {"facility_id":"RIV-014"}
  ],
  "channels":["fax"],
  "override_flags":{"in_network":"override","override_reason":"Blue plan OON; CM approved"},
  "notes":"Left VM; fax packet if no call back.",
  "packet":"Standard",
  "user":{"id":"crs.mlee","role":"crc_tech"}
}

Bulk “Send now” (per-row channels & docs)

{
  "action":"send_now",
  "bulk_create_id":"BULK-2025-09-22-1102",
  "rows":[
    {"facility_id":"WSD-001","channels":["fax"],"documents":["Standard"],"endpoints":{"fax":"215-555-0199"}},
    {"facility_id":"CABH-090","channels":["fax"],"documents":["Standard","302Docs"],"endpoints":{"fax":"215-555-0102"}}
  ],
  "user":{"id":"cm.tperez","role":"case_manager"}
}


⸻

Implementation checklist
	•	Add Search buttons in SSOT header and Quick Update footer; wire enablement rules.
	•	Minimal & Expanded popovers per ASCII above.
	•	Verify rule (server) using pseudocode; return outcome + reasons per facility.
	•	Operational store tables (PLACEMENT_SEARCH, PLACEMENT_CONTACT_LOG); mirror to Clarity for reporting.
	•	Channels: Fax/Direct/EMR queue integrations + error handling.
	•	Consent/BTG gating hooks for gated docs.
	•	In Basket task creation for “Next steps.”
	•	Audit logging for all actions.
	•	QA: execute acceptance criteria + 8 end‑to‑end scenarios (draft → verify → publish → generate/print/send → log).

⸻

If you want, I can spin out (1) the rule spec as a separate doc, (2) a minimalist JSON schema for PLACEMENT_SEARCH, and (3) a tiny seed CSV for 20 facilities you can use in the prototype.

