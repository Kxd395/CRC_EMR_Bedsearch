# CRC SSOT Prototype – Retest Findings & Recommendations

## Overview
This document captures the outcomes of the latest end-to-end walkthrough of the CRC SSOT prototype after toolchain modernization and layout refactors. The objective was to validate critical workflows (Running Note, Facility Finder, Tasks/Activity logging) and to exercise the new settings controls that let reviewers tailor which surfaces are visible.

## Validation Summary
- **Navigation:** Workflow tabs now switch reliably between Running Note, Facility Finder, Tasks & Approvals, and Activity Log. Hidden tabs surface a toast reminder that the panel was disabled via Settings.
- **Settings Gear:** Users can toggle secondary panels (Contact Planner, Patient List, Workflow Timeline, Directory Steward, Audit & Privacy) and whole tabs without breaking layout. Active Placement Searches remains locked per requirements, and selections persist across reloads; use Save & Close after adjusting.
- **Facility Finder:** Directory cards render with seeded facilities; typing in the search field filters results, and action buttons intentionally raise storyboard toasts (no live routing implemented yet).
- **Activity Log:** New entries append to the patient’s feed and respect the clear/reset controls. Timeline advance/reset shortcuts work and update the workflow chip states.
- **Quick Update & Prior Auth:** Quick reasons continue to update placement searches, trigger conflict checks, and roll changes into the PA summary card. Drawer saves still propagate audit history and SSOT notes.

## Outstanding Gaps
- **Prototype-only actions:** Drawer “Select facility”, packet publish, directory stewardship buttons, and several Quick Update simulators remain storyboarded (toast-only). Implementations will be required before production hardening.
- **Preference resilience:** Validate stored layout preferences, handle corrupt data gracefully, and plan for account-backed sync when available.
- **Data separation:** Facility Finder uses a static in-memory directory; real deployments will need API-backed search, pagination, and error states.
- **Accessibility pass:** Hidden elements rely on the `hidden` attribute, but additional aria-live/roles should be staged when wiring real data to ensure SR users are informed of panel state changes.

## Recommendations
1. **Validate stored preferences and surface recovery flows** so corrupt localStorage automatically falls back to defaults (with a toast) before syncing to account-backed storage in the future.
2. **Implement actionable Facility Finder interactions** (select, compare, publish) backed by stub APIs to move beyond storyboard toasts and validate orchestration logic.
3. **Wire audit exports and directory admin buttons** to placeholder modals or download mocks, ensuring end-to-end flow coverage ahead of production integrations.
4. **Add automated smoke tests** covering tab switching, facility filtering, activity logging, and settings toggles to prevent regressions in the single-page bundle.
5. **Schedule an accessibility review** to layer aria attributes and keyboard focus management onto the new toggle and navigation controls.

## Testing Notes
- Local validation used `npm run build` to confirm Vite bundling success (last run: see `dist/` artifacts dated current session).
- Manual code review inspected `src/app.js` event bindings and state transitions for Facility Finder, Activity Log, and Settings toggles; no unhandled errors identified.
- Legacy backups are archived under `doc/archive/ui_prototype/` to keep the active workspace aligned with deployable assets; they can be restored if historical reference is needed.
