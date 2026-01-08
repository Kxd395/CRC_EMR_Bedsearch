# UI Addendum v2.1 — Contact Planner Popover, Bed-Search Audit, and Dockable Finder

This addendum specifies the changes requested for the prototype screen:

## A) Contact Planner — richer info + clickable popup
**Goals**
- Display who logged each contact/bed search and the outcome.
- Allow quick filtering by status (Denied, Pending Review, No Beds, Left VM, Accepted, etc.).
- Provide a compact row with a **clickable popover** that shows full details and actions.

**Row fields (columns)**
- Timestamp (local)
- Facility (linked to card)
- Action (Call, Fax, Packet Sent, Bed Search, Acceptance, Denial, etc.)
- Outcome/Status (see enumerations below)
- Notes (truncated)
- **Added by** (user display + ID)
- Quick actions (Log attempt, Copy to packet)

**Popover fields**
- Facility and verified badges
- Contacted by (user) and role
- Method (phone/fax/direct/email) + number/address used
- Outcome/Status and **Reason codes** (e.g., No beds, Awaiting review, 302 not accepted, MAT mismatch)
- Next step selector: (Call back, Send packet, Await review, Escalate) + date/time
- One-click: *Create task to CRC Placement Pool*

**Filters (chips above the timeline)**
- `Accepted`, `Denied`, `Pending Review`, `No Beds`, `Left VM`, `Awaiting Fax`, `Packet Sent`, `Auth Required`, `Unknown`
- Search box (facility name, user, notes)
- Sort toggle: `Last attempt` | `Facility`

**Color & icon map (cards + chips)**
- Accepted ✓ (green), Denied ⨯ (red), Pending Review ⧗ (amber), No Beds ∅ (gray), Left VM ☏… (gray-blue), Packet Sent ✉︎ (indigo), Fax Sent 🖨 (purple), Auth Required 📝 (orange), Unknown ? (muted).
- Provide tooltips and legend in the right panel footer.

## B) Dockable Finder (right side) — movable + resizable
**Behavior**
- Pane can be **dragged** by a top-left **grip handle** and **resized** from left/bottom edges.
- Dock positions: `right` (default), `left`, or **floating**; snap to 16px grid.
- State is **remembered per user** (local storage for prototype; user prefs in production).
- Keyboard accessibility: handle is a `role="separator"` with `aria-orientation="vertical"`, arrow keys adjust width; `Esc` closes; `Tab` keeps focus trapped when open.

**Sections inside the Finder**
- Filters (including the new status chips)
- Results list (cards with badges)
- Footer: legend + staleness badge info

## C) Data model updates
**Operational log**: `PLACEMENT_CONTACT_LOG`
- `log_id`, `patient_id`, `visit_id`, `facility_id`, `action`, `outcome_status`, `reason_code[]`, `channel`, `contact_value`, `note`, `user_id`, `user_display`, `timestamp`, `next_action`, `next_at`

**Visit SSOT summary SDEs** (aggregates for quick view)
- `SDE.CRC.RUNNOTE.CONTACT_LAST_ACTION`
- `SDE.CRC.RUNNOTE.CONTACT_LAST_OUTCOME`
- `SDE.CRC.RUNNOTE.CONTACT_LAST_USER_ID`
- `SDE.CRC.RUNNOTE.CONTACT_STATUS` (Searching | AwaitingReview | Denied | Accepted | NoBeds | PacketSent | Canceled)

## D) Acceptance criteria (additions)
- **CP-1:** Clicking any Contact Planner row opens a popover with the fields listed above; keyboard users can open with `Enter` and close with `Esc`.
- **CP-2:** Rows display **Added by** (user) and show a tooltip with full name and role.
- **CP-3:** Status chips filter the timeline; combinations are additive; counts are shown next to each chip.
- **CP-4:** Finder panel is draggable and resizable, snaps to grid, and persists position/size between sessions.
- **CP-5:** Denied/Pending/No Beds filters show only matching events; colors/icons match the legend.

## E) Accessibility
- Popover has `role="dialog"`, labelled by the facility name; focus trapped within until closed.
- Handle uses `role="separator"`, `aria-valuenow` for width, `aria-controls` referencing the Finder container.
- All status chips are accessible buttons with `aria-pressed` state.
