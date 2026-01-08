# CRC SSOT UI – Copilot Guide

## Where to work
- Active code lives in `ui_prototype/`; adjacent folders under `doc/` and `organized/` hold specs, audits, and legacy backups.
- Netlify and local runs both rely on the Vite project in `ui_prototype`; avoid touching `doc/archive/ui_prototype/` except for historical reference.
- The UI is a static single-page app: `index.html` defines DOM scaffolding, `src/main.js` just imports CSS + `app.js`, and everything else is plain ES modules.

## Build & validation
- Install once with `npm install` inside `ui_prototype/`, then use `npm run dev` for HMR and `npm run build` before committing major refactors.
- `npm run lint` (ESLint flat config) is the primary automated check; run it after editing JS modules.
- `npm run preview` mirrors the Netlify deploy; prefer it when validating bundled assets.
- Prototype assets assume a module-friendly server—`python -m http.server` will break due to bare import specifiers.

## Frontend architecture
- `src/app.js` is an IIFE that wires every panel based on DOM IDs defined in `index.html`; keep new logic encapsulated in helpers or extracted modules to stay manageable.
- Status, facility finder, quick update, prior auth, settings, and activity log features are grouped in long sections—follow existing patterns rather than introducing frameworks.
- `renderCommitmentPanel` in `src/commitmentPanel.js` renders the legal summary; `app.js` passes patient fixtures plus persisted settings, so update both sides when adding commitment fields.
- CSS is centralized in `src/styles/main.css`; palette changes should flow through the design tokens already in place (see `RESTORE_NOTES.md`).

## Data fixtures & persistence
- Canonical facility data lives in `src/data/facilityDirectory.js`; helper transforms are exposed via `transformForFacilityFinder` and `transformForCommitmentPanel`.
- Patient seeds (`src/data/newPatientScenarios.js`) power every workflow. Update them instead of hard-coding new scenarios in `app.js`.
- LOC filtering helpers (`src/data/locMasterIntegration.js`) simulate async data loads—retain the async signatures so future API swaps stay trivial.
- Layout and commitment preferences persist via `localStorage` keys `crc-ssot-panel-visibility` and `crc-ssot-commitment-settings`; always guard reads/writes for missing or corrupt JSON.

## Status & workflows
- Status styling is driven by `STATUS_STYLES`, `STATUS_KEY_ALIASES`, and `getStatusPresentation()` in `app.js`; extend these hashes when introducing new states so chips, history, and badges stay in sync.
- Bed search updates flow through `BedSearchEventTypes`, `addSearchEvent()`, and `deriveSearchStatus()`—use these helpers instead of mutating `search.status` directly.
- Commitment fixtures (`src/data/commitmentFixtures.js`) derive facility matches via `realFacilities`; keep their IDs aligned with patient scenario IDs so the summary renders correctly.
- Toasts and storyboard banners intentionally stub out unimplemented backend calls; prefer raising a toast rather than silently failing when wiring new demo actions.

## Reference docs
- `ui_prototype/README.md` captures dev workflows; `doc/ui_prototype/DESIGN_COMPONENT_OVERVIEW.md` maps UI regions back to markup and JS sections.
- Prior auth behavior is documented in `doc/ui_prototype/PA_PART1_IMPLEMENTATION.md`; mirror its heuristics when extending that module.
- Latest usability findings live in `doc/ui_prototype/RECOMMENDATIONS.md`; check there before altering layout toggles or storyboard flows.

## Common utilities
- `test_uniqueness.js` sanity-checks the "only one search per facility" rule; run `node test_uniqueness.js` after changing search creation logic.
- `updatePatientData.js` was a one-time migration script—keep it untouched unless re-running the bulk import pipeline.
- Restore points under `ui_prototype/restore_points/` document major refactors; consult them before undoing palette or layout changes.
