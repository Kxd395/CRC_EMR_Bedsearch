# Status Palette (Canonical)

_Source_: `ui_prototype/src/app.js` (`STATUS_STYLES`, `pickBadgeTextColor`)

| Status Key | Label | Badge Hex | Badge Text | Background Hex | Icon |
| --- | --- | --- | --- | --- | --- |
| `searching` | Searching | `#6B7280` | `#ffffff` | `#F3F4F6` | ⟳ |
| `packet_sent` | Packet sent | `#2563EB` | `#ffffff` | `#EFF6FF` | 📤 |
| `accepted` | Accepted | `#16A34A` | `#000000` | `#ECFDF5` | ✓ |
| `waiting_transport` | Waiting transport | `#4F46E5` | `#ffffff` | `#EEF2FF` | 🚗 |
| `pending_review` | Pending review | `#D97706` | `#000000` | `#FFFBEB` | ⏰ |
| `no_beds` | No beds | `#334155` | `#ffffff` | `#F1F5F9` | 🛏️ |
| `denied` | Denied | `#DC2626` | `#ffffff` | `#FEF2F2` | ✗ |
| `canceled` | Canceled | `#0EA5E9` | `#000000` | `#F0F9FF` | 🚫 |
| `expired` | Hold expired | `#52525B` | `#ffffff` | `#FAFAFA` | ⧗ |
| `reassess_required` | Reassess required | `#C026D3` | `#ffffff` | `#F8E8FF` | ⚠️ |

## Accessibility Notes

`pickBadgeTextColor(badgeHex)` compares contrast ratios between the badge color and white/black using WCAG 2.1 calculations (`contrastRatio`, `luminance`). It selects whichever meets or exceeds the 4.5:1 threshold; if both fail, it falls back to the higher ratio (white wins ties). This keeps badge text legible across the palette without manual overrides.
