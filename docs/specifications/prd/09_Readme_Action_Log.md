# README & Action Log — CRC SSOT Placement Note + CRC Facility Finder

**Owner:** Kevin J. Dial  
**Created:** 2025-09-22

## Action Log
- 2025-09-22: Created full PRD package (PRD, field dictionary, schema, rules, acceptance criteria, test scripts, governance, checklist, email).
- 2025-09-23: Added static Navigator prototype (ui_prototype/) for Running Note + Facility Finder walk-through.
- 2025-09-24: Expanded prototype with role-driven workflow, BPAs, break-glass, packet preview, and multi-scenario data.

## Notes
- Awaiting decisions on operational data store and SUD segmentation confirmation.
- All SDEs normalized under `SDE.CRC.RUNNOTE.*` and `SDE.CRC.TOX.*`.

## Next Steps (owner)
1. Send cover email with zip to Epic Build Team and stakeholders.
2. Collect approvals for the five decision points.
3. Schedule build kickoff and assign task owners.

## Prototype Preview
- Open `ui_prototype/index.html` in a browser; pick a patient scenario from the dropdown to load seeded data.
- Capture Quick Updates (MAT, 302, transfer status) and save to sync Storyboard, tasks, and patient list.
- Use the Finder search bar, ASAM/MAT chips, and `More` details to explore ranked facility cards with staleness badges.
- Use Facility Finder filters to exercise confirm/warn/block BPAs, override logging, and filter chips.
- Click `Add Search` to launch the placement search popover, run Verify, and publish bed searches into the SSOT/history.
- Open the packet preview to compare full vs privacy-limited packets; finalize only when reassessment and overrides are cleared.
- Trigger `Simulate new tox result` or `Scan ROI` to see reassessment tasks, break-the-glass, and consent-driven views update.
- Review the Activity Log, Timeline, and Audit panels to see how each interaction is captured for HIM/Privacy.

## Scenario Guide
- S1 Normal flow: select Jordan Rivera, choose Friends Hospital, send packet, finalize.
- S2 Mismatch warn: switch to Alicia Gomez, pick Behavioral Wellness Center to trigger warn, then choose Albert Einstein Medical Center for confirm.
- S3 Hard block: load Tyler Brooks, attempt Citizens Acting Together (block) then override with documented reason.
- S4 UDS trigger: choose Mei Chen, run `Simulate new tox result`, process reassessment before finalizing.
- S5 Scan ROI: switch to Omar Wallace, use `Scan ROI` to flip Act 148/SUD flags and compare packet views.
- S6 Stale directory: toggle `Hide stale` off to surface Delaware Valley (30+ days) and observe red staleness badge.
- S7 Bed search workflow: use `Add Search`, select facilities (e.g., Friends Hospital), Verify, and Publish to record the search.

## Facility Finder Spec
- Detailed build spec in `11_Facility_Finder_Spec.md` (UI, API, scoring, acceptance tests).
- Philadelphia facility sample pulled from `/Applications/MyApps/AxxessPhilly/projects/Website_Filter_Database/data/facilities.json` (filtered in prototype).
