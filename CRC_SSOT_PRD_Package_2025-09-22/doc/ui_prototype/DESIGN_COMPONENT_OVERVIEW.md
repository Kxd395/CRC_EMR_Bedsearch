# CRC SSOT EMR Prototype – Component Description

This document summarizes the major surfaces of the CRC Single Source of Truth (SSOT) prototype, highlighting what appears in each portion of the UI so stakeholders can quickly orient themselves when reviewing the spec.

## Global Shell
- **Header:** Displays app branding and the active user role (`index.html#L10`).
- **Patient Context Bar:** Scenario selector plus MRN/FIN, consent flags, and a break-the-glass control (`index.html#L17`).
- **Workflow Tabs:** Primary navigation between Running Note, Facility Finder, Tasks & Approvals, and Activity Log (`index.html#L47`).
- **Storyboard Banner:** Contextual alerts (e.g., new toxicology results) with override handling (`index.html#L63`).
- **Settings Modal:** Gear control opens layout toggles; selections persist via `localStorage` and control tab/panel visibility (`index.html#L1328`, `src/app.js#L2005`).
- **Reset Defaults:** Modal footer provides a one-click reset that restores `panelLayoutDefaults` and re-enables all tabs/panels (`index.html#L1334`, `src/app.js#L2013`).

## Running Note Workspace (noteTab)
- **Assessment Overview Card:** Read-only fields for ASAM level, MAT, acuity, and placement needs sourced from the scenario (`index.html#L90`).
- **Prior Authorization Module:** Multi-section form with expandable panels, action shortcuts, and a generated summary card (`index.html#L180`). Key behaviors handled in `src/app.js#L3000`.
- **Quick Update (SSOT) Composer:** Target selector, reason codes, note entry, and automation toggles for syncing to SSOT, audit, and status updates (`index.html#L420`).
- **Contact Planner Card:** Next/last contact context with quick action buttons for packet and ROI workflow (`index.html#L470`).
- **Active Placement Searches:** Filterable list of facility outreach efforts with status chips and channel metadata (`index.html#L500`).
- **Patient List Preview:** Table snapshot of the broader placement board with transport, MAT, and reassessment flags (`index.html#L550`).
- **Recent Placement Searches:** Time-ordered activity strip for the current patient (`index.html#L590`).

## Facility Finder (finderTab)
- **Smart Search Bar:** Patient-aware directory search with clear/reset control (`index.html#L630`).
- **Filter Grid:** ASAM, MAT, 302 status, payer, distance, and stale/block toggles bound to `facilityFilters` logic (`index.html#L650`).
- **Results Gallery:** Dynamic cards reflecting eligibility, match scores, and call-to-action controls (`index.html#L690`).
- **Facility Detail Drawer:** Deep edit surface for status, acceptance details, transport, documents, audit trail, and SSOT publishing (`index.html#L720`).
- **Directory Steward Console:** Summaries of data hygiene tasks and quick link into directory administration (`index.html#L930`).

## Tasks & Approvals (tasksTab)
- **Task Ledger:** Chronological list of outstanding work items with ownership and urgency styling (`index.html#L820`).
- **Handoff Notes:** Shift summary copy and action to notify the next team (`index.html#L830`).

## Activity Log (activityTab)
- **Real-Time Feed:** Live updates of outreach events with structured action/outcome metadata (`index.html#L850`).
- **Activity Entry Form:** Allows logging new actions, outcomes, and supporting notes, leveraged by placement staff (`index.html#L860`).

## Workflow Summary Rail
- **Timeline:** Step tracker for placement lifecycle with controls to advance/reset (`index.html#L890`).
- **Audit & Privacy Review:** Latest break-glass and override entries for compliance review (`index.html#L910`).

## Prior Authorization Highlights
- **Header Section:** Payer/plan selectors and contact metadata (`index.html#L210`).
- **Expandable Modules:** Authorization, decision, submission, and guardrail sections that expand/collapse in the UI (`src/app.js#L3010`).
- **Summary Card:** Generated recap of submitted PA data with status highlighting (`src/app.js#L3120`).
- **Automation Hooks:** Actions from Quick Update and task flows call `priorAuthModule.refreshDisplay()` for synchronization (`src/app.js#L3290`).

## Quick Update Workflow
- **Target Options:** Apply updates to the active facility search or SSOT-only record keeping (`index.html#L430`).
- **Reason Catalog:** Mapped to status changes and PA updates via `quickReasonDefinitions` (`src/app.js#L60`).
- **Automation Toggles:** Allow or suppress status, audit, and SSOT writes per update (`index.html#L460`).
- **Simulators:** Launch transfer packet preview or trigger new toxicology result to demo reassessment logic (`index.html#L470`).

## SSOT Bed Search & Directory Experience
- **Search List Card:** Aggregated view of all active searches for the patient plus filtering controls (`index.html#L500`).
- **Facility Drawer:** Central hub for editing statuses, documenting acceptance, and publishing updates to SSOT (`index.html#L1040`).
- **Patient List Preview:** Mirrors wider census data, providing context for bed availability and reassessment requirements (`index.html#L550`).

## Data & State Management
- **Scenario Seeds:** Patient fixtures (`patientScenarios`) encode identifiers, note content, placement board status, and search history (`src/app.js#L120`).
- **Local Storage Persistence:** User adjustments and layout visibility choices are cached client-side for demo continuity (`src/app.js#L500`, `src/app.js#L2005`).
- **Status Palette & Enumerations:** Canonical definitions for status chips, quick reasons, and communication channels (`src/app.js#L20`).

## Related Documentation
- `README.md#L1` – toolchain setup, scripts, and deployment guidance.
- `README_AUDIT_NOTES.md#L11` – audit log of significant project changes.
- `netlify.toml#L1` – deploy command publishing the bundled `dist/` output.
