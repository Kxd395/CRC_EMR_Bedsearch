# Placement Logic Fixes v2.3 — Separate Searches, Status Colors, and Acceptance → Placement

**Date:** 2025-09-22  
**Owner:** Kevin J. Dial

## 1) Correct Multi‑Add Semantics
- **Each selected facility becomes its own `PLACEMENT_SEARCH` row**; rows are linked by `bulk_create_id`.
- Default **status** on create: `Searching` or `PendingReview` (if packet sent during creation).
- Disallow silent merging: if a row already exists for the same facility within 12 hours, prompt: **Update existing** or **Create new anyway** (with reason).

## 2) Status Colors & Badges (list + legend)
- **Accepted** — green (✓)
- **PendingReview / AwaitingCallback / AwaitingFax / PacketSent** — yellow/amber (⧗/✉︎/🖨)
- **Denied** — red (⨯)
- **NoBeds** — gray (∅)
- **Searching** — blue‑gray (…)
- **Canceled** — muted gray (—)

**UI rules**
- Row **background tint** matches status color.
- Status chip shows icon + label; tooltip displays last update TS and user.
- Patient list preview shows **Placement** = **Yes (green)** only when SSOT reflects an **Accepted** facility (see §3).

## 3) Acceptance Flow — “Record Acceptance” → Promote to Placement
- From any search row, user clicks **Record Acceptance** (or **Mark Accepted**).
- Dialog captures acceptance details (below). On Save:
  - Set `PLACEMENT_SEARCH.status = Accepted` and store acceptance metadata.
  - Write SSOT roll‑ups and **selected facility**:
    - `SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID`, `SDE.CRC.RUNNOTE.FACILITY_SELECTED_TS`
    - `SDE.CRC.RUNNOTE.PLACEMENT_STATUS = Accepted`
    - `SDE.CRC.RUNNOTE.ACCEPTED_BY_NAME`, `ACCEPTED_BY_ROLE`
    - `SDE.CRC.RUNNOTE.ACCEPTED_UNIT`, `ACCEPTED_BED_HOLD_UNTIL`
    - `SDE.CRC.RUNNOTE.TRANSPORT_MODE`, `PICKUP_TS`, `DESTINATION`
    - `SDE.CRC.RUNNOTE.CONTACT_LAST_USER_ID` = user
  - Offer **Cancel other open searches** (checkbox). If checked, set their `status = Canceled` with reason “Accepted elsewhere”.

### Acceptance Details — Dialog Fields
- **Accepting Facility** (read‑only from row)
- **Accepting Clinician** (Name, Role, NPI optional)
- **Facility Rep** (Name, Role, Phone)
- **Unit / Level‑of‑Care** (e.g., 3.1/3.7/4.0; unit name/bed type/room optional)
- **Bed Hold Until** (date/time) — required if given over phone
- **Acceptance Ref / Case #** (text)
- **Conditions** (pre‑auth, meds to accompany, isolation, etc.)
- **Transport Plan** (Mode, Vendor, Pickup at, Destination, ETA, Special instructions)
- **Attachments** (acceptance fax PDF/image id)

## 4) Denials / No Beds — Required Metadata
- When setting `Denied`, capture **denied_by**, **reason** (picklist + free text), **can_reapply_at**.
- For `NoBeds`, capture **recheck_at** (default +3h) and offer **Auto‑remind** task to CRC Placement Pool.

## 5) Additional Guardrails & Automation
- **Auto‑staleness badge**: Pending statuses >4h → amber “Check back”; >24h → red “Aging”.
- **Escalation**: Optional BPA if 302 + no accepting facility after T hours.
- **Reassessment gate**: If tox posts after acceptance ⇒ set `REASSESS_FLAG=Y`, disable Finalize until reassessed or overridden.
- **Out‑of‑network policy**: If accepted OON, require attested reason.
- **Duplicate detection**: Soft warn if adding another search to same facility within 12h window.
- **Transport dependencies**: If Secure transport required by 302, prevent Finalize until Transport fields complete.

## 6) Data Model Additions

### `PLACEMENT_SEARCH` (operational)
Add fields:
- `status_reason` (text)
- `accepted_by_name`, `accepted_by_role`, `accepted_by_npi` (nullable)
- `facility_rep_name`, `facility_rep_role`, `facility_rep_phone`
- `accepted_unit`, `accepted_bed_type`, `accepted_room`, `accepted_bed_hold_until`
- `acceptance_ref`
- `transport_mode`, `transport_vendor`, `pickup_ts`, `destination`, `eta_ts`, `transport_notes`
- `attachment_acceptance_id` (nullable)

### SSOT SDEs (visit roll‑ups)
- `SDE.CRC.RUNNOTE.PLACEMENT_STATUS` (Searching | Accepted | Denied | NoBeds | Canceled)
- `SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID`
- `SDE.CRC.RUNNOTE.FACILITY_SELECTED_TS`
- `SDE.CRC.RUNNOTE.ACCEPTED_BY_NAME`
- `SDE.CRC.RUNNOTE.ACCEPTED_BY_ROLE`
- `SDE.CRC.RUNNOTE.ACCEPTED_UNIT`
- `SDE.CRC.RUNNOTE.ACCEPTED_BED_HOLD_UNTIL`
- `SDE.CRC.RUNNOTE.TRANSPORT_MODE`
- `SDE.CRC.RUNNOTE.PICKUP_TS`
- `SDE.CRC.RUNNOTE.DESTINATION`