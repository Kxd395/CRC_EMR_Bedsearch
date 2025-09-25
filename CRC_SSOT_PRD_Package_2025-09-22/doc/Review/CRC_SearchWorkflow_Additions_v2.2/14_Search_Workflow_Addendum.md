# Search Workflow Additions v2.2 — SSOT "Add Search", Multi‑Select Sending, Packet Print, and Search List Editing

**Date:** 2025-09-22  
**Owner:** Kevin J. Dial

## 1) New "Add Search" action on Running Note
- Button group in the SSOT header: **Add Search** ▾
  - Add Search (single)
  - Add Multiple… (bulk select)
  - Paste list (IDs or names; fuzzy‑match)
- Opens **Search Multi‑Add** modal:
  - **Facility picker** (multi-select with search & keyboard support)
  - **Channels per facility:** Fax, Secure Email (Direct), EMR Clinicals (Epic‑to‑Epic / Care Everywhere / Chart Sharing)
  - **Apply to all** toggles for each channel and for document sets
  - **Packet selector** (checklist of document sets; see §3)
  - **ROI/Part‑2 check** shows SUD/HIV scoping; disables sensitive docs if not authorized (or requires BTG/ROI)
  - **Create searches** creates one row per facility and optional **Generate packets** (checkbox)
  - **Group ID (bulk_create_id)** recorded for batch auditing

## 2) Multi‑select send & print
- After searches are created:
  - **Send** by channel: Fax queue, Secure Email queue, or EMR Exchange (record target site)
  - **Print packets** for fax: generates printable bundle (PDF) per facility; opens print dialog or saves PDF
  - Each packet gets a **packet_hash** and **printed_pdf_id** for audit

## 3) Packet templates (selectable)
- Core Clinical Summary
- ASAM/LOC summary
- Medication list
- Last methadone/bupe dose timestamps
- Vitals 24h
- Labs non‑sensitive
- Labs — SUD (screen/confirm) **(gated by ROI/BTG)**
- 302 documents (if applicable)
- Demographics & insurance
- ROI forms (if on file)
- Facility instructions cover sheet

## 4) View / Edit Search List
- **Search List panel** shows all searches for the visit with columns:
  - Created, Facility, Channels, Documents, Status, Notes, **Added by**, Last action, Next step/time
- **Inline edit** for Status, Notes, Next step/time
- **Row actions:** Edit, **View Full Screen**, Send, Print packet, Copy link, Delete (role‑gated)
- **Full‑screen view** (dialog) shows audit trail (contact attempts), channel endpoints, packet preview, and allows updates
- **Filters/chips:** Accepted, Denied, Pending Review, No Beds, Left VM, Packet Sent, Auth Required, Awaiting Review, Unknown (combinable)
- **Sort:** Created, Facility, Last action
- **Search box** (facility, user, notes)

## 5) Data model

### New operational entity: PLACEMENT_SEARCH
- `search_id` (UUID)
- `patient_id`, `visit_id`
- `facility_id`, `facility_name`
- `channels` (array of: Fax, DirectEmail, EMR_Exchange)
- `channel_endpoints` (fax_number, direct_address, emr_site_id)
- `documents` (array of template codes)
- `status` (Searching | PendingReview | PacketSent | Accepted | Denied | NoBeds | Canceled)
- `notes` (text)
- `created_by` (user_id, display)
- `created_ts` (timestamp)
- `updated_ts` (timestamp)
- `next_action` (CallBack | SendPacket | RecheckBeds | Escalate | None)
- `next_at` (timestamp | null)
- `printed_pdf_id` (nullable), `packet_hash` (nullable)
- `bulk_create_id` (nullable) — batch identifier for multi-add
- `last_action` (denormalized text)
- Relationship: **one‑to‑many** `PLACEMENT_CONTACT_LOG` (contact attempts per search)

### Visit‑level SSOT SDE summaries (add)
- `SDE.CRC.RUNNOTE.SEARCH_COUNT`
- `SDE.CRC.RUNNOTE.SEARCH_LAST_TS`
- `SDE.CRC.RUNNOTE.SEARCH_STATUS` (aggregate state)
- `SDE.CRC.RUNNOTE.PACKET_PRINTED_LAST_TS`

## 6) Security & Part‑2
- Packet selector enforces ROI/BTG; SUD/HIV docs disabled unless authorized
- All sends/prints logged (user, timestamp, facility, packet composition, channel endpoint)
- BTG banner visible while SUD content is accessible

## 7) Acceptance criteria (new)
- **SRCH‑1:** Clicking **Add Search** opens modal; multi-select works with keyboard; **Apply to all** sets channels and packet list for all selected facilities.
- **SRCH‑2:** Creating multiple searches writes rows (one per facility) with `bulk_create_id` and shows toast with count created.
- **SRCH‑3:** Selecting **Generate packets** creates packet bundles and records `packet_hash` + `printed_pdf_id` on success.
- **SRCH‑4:** Search List supports inline edits for Status/Notes/Next step/time; updates audit and refreshed timestamps.
- **SRCH‑5:** **View Full Screen** shows all fields, actions log, and a **Print packet** button.
- **SRCH‑6:** Filters (Denied, Pending Review, No Beds) reduce the list to matching entries; counts update.
- **SRCH‑7:** Attempting to include SUD/HIV documents without ROI/BTG shows an authorization prompt and disables selection.
- **SRCH‑8:** Bulk operations persist UI state per user and are fully keyboard accessible.

## 8) Test scripts (additions)
- **TS‑SRCH‑01:** Multi‑Add creates N searches with correct channels/docs and a shared `bulk_create_id`.
- **TS‑SRCH‑02:** Packet print generates printable bundle; audit row captures user, facility, `packet_hash`, timestamp.
- **TS‑SRCH‑03:** Inline edit of Status to "PendingReview" updates row and summary SDEs.
- **TS‑SRCH‑04:** Full‑screen view shows contact attempts and allows status/notes update; save refreshes list.
- **TS‑SRCH‑05:** Part‑2 gating prevents adding SUD labs to packet without ROI/BTG; prompt appears.
