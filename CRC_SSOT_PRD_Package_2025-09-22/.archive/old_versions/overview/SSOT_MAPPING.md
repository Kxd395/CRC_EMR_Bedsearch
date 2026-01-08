# SSOT Mapping — Bed Search Workflow

Sources: `ui_prototype/src/app.js` (`STATUS_STYLES`, normalization helpers), `ui_prototype/src/data/newPatientScenarios.js` (event samples), `ui_prototype/RESTORE_NOTES.md`. Additional event kinds marked with `(spec-only)` follow the product specification when code samples were unavailable.

## Canonical Status Palette → Primary Stage (Card Color)

| Primary Stage (key) | Label | Badge Hex | Background Hex | Icon |
| --- | --- | --- | --- | --- |
| `searching` | Searching | `#6B7280` | `#F3F4F6` | ⟳ |
| `pending_review` | Pending review | `#D97706` | `#FFFBEB` | ⏰ |
| `packet_sent` | Packet sent | `#2563EB` | `#EFF6FF` | 📤 |
| `no_beds` | No beds | `#334155` | `#F1F5F9` | 🛏️ |
| `accepted` | Accepted | `#16A34A` | `#ECFDF5` | ✓ |
| `waiting_transport` | Waiting transport | `#4F46E5` | `#EEF2FF` | 🚗 |
| `expired` | Hold expired | `#52525B` | `#FAFAFA` | ⧗ |
| `denied` | Denied | `#DC2626` | `#FEF2F2` | ✗ |
| `canceled` | Canceled | `#0EA5E9` | `#F0F9FF` | 🚫 |
| `reassess_required` | Reassess required | `#C026D3` | `#F8E8FF` | ⚠️ |

Only one primary stage is selected per card; it dictates the border/background color injected by `injectStatusThemeStyles()`.

## Event Types (Append-Only)

| Event Type | Payload Highlights | Primary Stage Impact | Facet Impact |
| --- | --- | --- | --- |
| `call_outcome` (`no_beds`, `bed_available`, `facility_denied`, `patient_denies`) | outcome string, optional `recheck_at` | Outcome drives stage precedence (`patient_denies` ⇒ `canceled`, `facility_denied` ⇒ `denied`, `no_beds` ⇒ `no_beds`, `bed_available` keeps search active) | May set `recheck` facet when `recheck_at` future |
| `docs_sent` / `packet_sent` | docs array | Upgrades stage to `packet_sent` when latest | Sets `docs` facet true |
| `acceptance` | `hold_until`, clinician metadata | Promotes to `accepted` stage; superseded by transport or terminal outcomes | Adds `accepted` facet; `hold` facet until `hold_until` lapses |
| `transport_scheduled` | `pickup_at`, vendor | Promotes to `waiting_transport` until pickup occurs | Sets `transport` facet; may interact with `hold` facet |
| `note` (spec-only) | `category` (`info`, `change`, `admin`, `reassess`) | Does not change stage directly | Sets `note` facet; `reassess` category also toggles `reassess` facet |
| `status_override` (spec-only, rare) | explicit `status` + attestation | Forces stage to provided canonical key | Adds `note` facet annotated as override |

Events are append-only: no updates or deletes. New events inherit version numbers, enabling deterministic rebuilds.

## Primary Stage vs. Facets

- **Primary Stage (color)**: Chosen by precedence order against the ordered event timeline (see below). Exactly one applies per search card.
- **Facets (chips)**: Secondary truths rendered as chips (e.g., "Hold until 17:00", "Docs sent"). Multiple facets may be active simultaneously; they never change the card color.

### Stage Precedence (highest first)

1. `canceled`
2. `denied`
3. `expired` (hold passed, no newer acceptance/transport)
4. `waiting_transport`
5. `accepted`
6. `packet_sent`
7. `no_beds`
8. `pending_review`
9. `searching`

`reassess_required` is an elevated alert facet-plus-stage that can supersede base colors when present (per `STATUS_STYLES`).

### Facet Definitions

| Facet | Activation Rule |
| --- | --- |
| `accepted` | Latest `acceptance` event still in effect (unless superseded by cancel/denial). |
| `hold` | `acceptance.hold_until` in the future; becomes `expired` stage when past. |
| `transport` | Latest `transport_scheduled` event pending pickup. |
| `docs` | Latest `docs_sent` or `packet_sent` event present. |
| `recheck` | `call_outcome` with future `recheck_at`; flagged overdue when past. |
| `insurance` | Placeholder facet toggled by note/admin events (spec-only fallback). |
| `reassess` | `note` or override indicating reassessment required; surfaces as purple stage/facet. |
| `note` | Any informational `note` event or `status_override` comment. |

## Uniqueness & Append-Only Guarantees

- Exactly **one active bed-search card per (`facility_id`, `FIN`)**: enforced by a partial unique index (`WHERE archived_at IS NULL`).
- Events (`bed_search_event`) are append-only with monotonically increasing `version` (see sample timelines); state is derived by replaying events in timestamp-descending order.
