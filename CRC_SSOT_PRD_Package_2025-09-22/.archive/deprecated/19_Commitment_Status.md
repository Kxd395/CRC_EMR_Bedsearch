# Commitment Status Panel (Legal-Only)

## Display Rules
- Render the commitment experience only when the Assessment “Commitment status” field contains a value (e.g. `302Required`, `201Active`).
- Clearing the Assessment field immediately hides both the collapsed summary line and the expanded card; no placeholder stub is shown.
- LEGAL_COMMITMENT data remains available server-side, but the UI stays hidden until a commitment is re-selected.

## Collapsed Summary Line
- Placed directly beneath the Assessment Overview block; collapsible control mirrors other SSOT summary strips.
- Contents: `COMMITMENT • {Type} ({Status}) • Expires in {hh:mm} • Docs {X}/{Y} • Next: {event} {timestamp}`.
- Red indicator dot appears when any legal guardrail is active (docs incomplete, court/hearing overdue, reassessment required).
- Button uses `aria-expanded` / `aria-controls`, Enter toggles expand/collapse, focus returns to the button on collapse.
- Text label: “Show/Hide commitment details for {patient}”.

## Expanded Panel Sections
The expanded card only renders sections relevant to the active commitment type:

| Commitment Type | Sections Rendered |
| --- | --- |
| 201 (Voluntary) | Required Documentation (201 list) + Court & Legal Schedule |
| 302 (Emergency involuntary) | Required Documentation (302 list) + Court & Legal Schedule + 302-capable facilities |
| 303 / 304 | Required Documentation (if available) + Court & Legal Schedule |
| Other / ECT | Only sections that have data (docs, schedule) |

Each section is omitted entirely when not relevant (no empty shells).

### Header Fields
- **Type** (read-only for prototype) – derived from Assessment + LEGAL_COMMITMENT.
- **Status** – Active, Pending, Requested, Approved, Expired, Discontinued.
- **Started** – Timestamp from LEGAL_COMMITMENT.
- **Expires in** – Countdown badge (amber when ≤25% window remains, red when overdue).
- **Legal notes** – Short, read-only memo supplying current legal context.

### Required Documentation
- Checklist sourced from `docsByType[type]` with live progress meter (`completed / total`).
- 302 guardrail highlights incomplete documentation, keeping the legal blocker active until resolved.

### Court & Legal Schedule
- “Next event” block shows event type, datetime, location, judicial officer, and service details.
- Prior events render newest-first for quick reference.
- Buttons (Add event, Print packet, Export summary) are storyboard toasts in the prototype.

### 302-Capable Facilities
- Rendered only for active 302 holds.
- Shows filter chips (TAKES_302, Secure BH, Acute Med Stab) and the filtered match list.
- “Select” and “Details” buttons raise storyboard toasts; “Open full Finder” defers to the placement flow.

### Quick Actions & Guardrails
- Default quick actions: Log petition, Mark 302 approved, Schedule 303, Record 201 discharge request, Upload doc, Generate court packet.
- Guardrails display as ✓/⚠️ list for:
  - `legalDocsComplete`
  - `courtDependencyOverdue`
  - `reassessFlag`
- Expanded panel shows a red “Legal blockers present” banner when any blocker is active; collapsed summary displays the red indicator.
- Finalize transfer is blocked when any legal guardrail is unresolved (transport gating is handled elsewhere in the app).

### Quick Update — Legal
- Target is always the visit’s commitment record.
- Actions pulled from fixture (`quickUpdate.actions`); updates status + appends audit; Copy-to-SSOT remains optional.
- Prototype Save clears the note field and displays a toast.

- Section visibility (documentation, schedule, 302 facilities, quick actions, quick update) can be toggled per user via the Settings modal. Hidden sections are omitted entirely from the expanded card while the summary line remains available.

## User Preferences (`crc-ssot-commitment-settings`)
```json
{
  "visible": true,
  "collapsedByDefault": false,
  "autoExpandOn302": true,
  "autoExpandOnPending": true
}
```
- Surfaces in the Settings modal under “Commitment Panel Preferences”.
- “Reset to defaults” restores the baseline values and clears per-patient expansion state.
- Layout toggles (`crc.layout.v1`) also include the commitment panel and sync the `visible` flag.

## Acceptance Criteria
1. No commitment selected → summary + panel hidden.
2. Commitment present → summary line renders; More… expands, Less… collapses.
3. Type change (201↔302↔303/304) immediately recomputes documentation, progress, visible sections, and facilities.
4. Countdown flips amber when ≤25% of the window remains and red when overdue.
5. Quick legal actions update status/audit; outstanding docs keep the legal blocker active.
6. Transport blockers never appear in this panel.
7. 302 facility list and filters respond to LEGAL_COMMITMENT data; “Select” passes control to placement flow (toast stub).
8. Panel state (expanded/collapsed) persists per patient while the tab is open; preferences persist between sessions.

## Data Fixture
- Source file: `src/data/commitmentFixtures.js`.
- Example:
```js
{
  type: '302',
  status: 'Active',
  startedAt: '2025-09-22T07:15:00-04:00',
  expiresAt: '2025-09-22T11:52:00-04:00',
  legalNotes: 'Emergency 302 hold; awaiting physician reassessment before sunset.',
  docsByType: {
    '302': [ { id: 'petition', label: 'Petition', completed: true, timestamp: '09/22 09:18' }, ... ],
    '201': [ ... ],
    'ECT': [ ... ]
  },
  schedule: {
    next: { event: '303 Hearing', datetime: '2025-09-23T11:30:00-04:00', location: 'Courtroom 2', served: 'Y', servedTo: 'Patient' },
    prior: [ { event: '302 Approved', datetime: '2025-09-22T07:40:00-04:00' } ]
  },
  facilityFilters: { takes302: true, secureBh: true, acuteMed: false },
  facilityMatches: [ { id: 'HOPE_RIDGE', name: 'Hope Ridge Detox — Secure', level: '3.7', verified: 'Verified 2d', tags: ['TAKES_302', 'Secure BH'] } ],
  quickActions: [ { id: 'logPetition', label: 'Log petition' }, ... ],
  quickUpdate: { actions: ['Petition filed', '302 approved', ...], updateStatus: true, appendAudit: true, copyToSsot: false },
  guardrails: { legalDocsComplete: false, courtDependencyOverdue: false, reassessFlag: false }
}
```
- Fixtures are automatically attached to matching scenarios (S1, S2) in `app.js`.

## Prototype Notes
- Rendering handled via `renderCommitmentPanel` (see `src/commitmentPanel.js`).
- Assessment dropdown changes live-update the summary/panel; clearing the field unmounts the UI.
- Quick actions, facility selection, and legal Save buttons raise storyboard toasts for now.
- Settings modal supports Escape-to-close, Save & Close, Reset to defaults, and commitment-specific preferences.
