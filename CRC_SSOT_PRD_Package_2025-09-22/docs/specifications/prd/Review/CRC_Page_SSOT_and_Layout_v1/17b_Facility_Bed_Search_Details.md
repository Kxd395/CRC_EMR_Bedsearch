# 17b_Facility_Bed_Search_Details — Expanded CRC Facility Bed Search Design

## 1) View Details Card (inline slideout)
```
───────────────────────────────────────────────────────────────────────────────
| FACILITY DETAILS — Friends Hospital                     [X] Close           |
| Status: [ ACCEPTED ✓ ]    Updated: 09/22 09:40 by Morgan Lee                |
| Summary: Bed hold 14:00; hold until 16:00. Intake to call at 14:00.         |
|----------------------------------------------------------------------------|
| ASAM Match: 3.7 Med Detox               Takes 302: Yes   Dual DX: Yes       |
| Channels: Fax (215-555-0102) ✓  | Secure Email (Direct): — | EMR: —        |
| Packet: CoreSummary ✓  ASAM ✓  Meds ✓  LastDose ✓  SUD Docs 🔒              |
|----------------------------------------------------------------------------|
| Acceptance                                                                ▾ |
|   Clinician: Dr. Patel (Medical Director)      Bed hold until: 16:00       |
|   Facility rep: Jamila R • 215-555-0102        Reference #: HR-2319        |
|   Conditions: Pre-auth by CBH; bring med list                                |
|----------------------------------------------------------------------------|
| Transport                                                                 ▾ |
|   Required: Yes   Mode: Secure van   Vendor: City EMS                      |
|   Pickup: 15:45   Destination: Friends Hospital — Detox   ETA: 16:15       |
|----------------------------------------------------------------------------|
| Capability overrides                                                      ▾ |
|   Methadone continue ✓  | Override reason: Directory out-of-date; verified |
|----------------------------------------------------------------------------|
| Audit trail                                                               ▾ |
|   09/22 09:40 — Acceptance recorded (ACCEPT_PHONE) — Morgan Lee           |
|   09/22 09:20 — Packet sent (Fax) — Morgan Lee                            |
|----------------------------------------------------------------------------|
| Quick actions: [ Edit info ]  [ Send packet ]  [ Record acceptance ▾ ]     |
───────────────────────────────────────────────────────────────────────────────
```

## 2) JSON Fixtures (reference data for prototype/test harness)

### 2.1 Inline "Edit info" popover update
```json
{
  "before": {
    "searchId": "FRIENDS-visit123",
    "status": "PendingReview",
    "status_reason_code": "PENDING_AWAITING_ROUNDS",
    "status_reason_text": "Packet sent 09:20",
    "accepted_by_name": null,
    "accepted_bed_hold_until": null,
    "one_line_summary": "Packet sent; awaiting rounds"
  },
  "after_inline_edit": {
    "searchId": "FRIENDS-visit123",
    "status": "Accepted",
    "status_reason_code": "ACCEPT_PHONE",
    "status_reason_text": "Bed hold 14:00; verify meds",
    "accepted_by_name": "Dr. Patel",
    "accepted_bed_hold_until": "2025-09-22T16:00:00-04:00",
    "one_line_summary": "Bed hold 14:00; verify meds"
  }
}
```

### 2.2 Quick Update (facility target)
```json
{
  "before": {
    "searchId": "TEMPLE-visit123",
    "status": "Searching",
    "status_reason_code": "SEARCHING",
    "status_reason_text": "",
    "audit": []
  },
  "quick_update_payload": {
    "target": "facility",
    "reason_code": "DENY_NO_PROGRAM",
    "note": "Declined — no methadone program",
    "side_effects": {
      "update_status": true,
      "append_audit": true,
      "write_to_ssot": false
    }
  },
  "after_quick_update": {
    "searchId": "TEMPLE-visit123",
    "status": "Denied",
    "status_reason_code": "DENY_NO_PROGRAM",
    "status_reason_text": "Declined — no methadone program",
    "audit": [
      {
        "ts": "2025-09-22T08:40:00-04:00",
        "user": "Morgan Lee",
        "action": "quick_update",
        "metadata": {
          "reason_code": "DENY_NO_PROGRAM",
          "note": "Declined — no methadone program",
          "target": "facility"
        }
      }
    ]
  }
}
```

### 2.3 Quick Update (SSOT-only target)
```json
{
  "before": {
    "visitId": "visit123",
    "sde": {
      "SDE.CRC.RUNNOTE.NOTES": "Morning assessment complete.",
      "SDE.CRC.RUNNOTE.LAST_QUICK_UPDATE_TS": "2025-09-22T08:00:00-04:00"
    }
  },
  "quick_update_payload": {
    "target": "ssot",
    "reason_code": "PACKET_SENT",
    "note": "Packet updated with latest labs.",
    "side_effects": {
      "update_status": false,
      "append_audit": true,
      "write_to_ssot": true
    }
  },
  "after_quick_update": {
    "visitId": "visit123",
    "sde": {
      "SDE.CRC.RUNNOTE.NOTES": "Morning assessment complete.\nPacket updated with latest labs.",
      "SDE.CRC.RUNNOTE.LAST_QUICK_UPDATE_TS": "2025-09-22T09:12:00-04:00"
    },
    "audit": [
      {
        "ts": "2025-09-22T09:12:00-04:00",
        "user": "Morgan Lee",
        "action": "quick_update",
        "metadata": {
          "target": "ssot",
          "reason_code": "PACKET_SENT",
          "note": "Packet updated with latest labs."
        }
      }
    ]
  }
}
```

---

*Drop this appendix into facility-bed-search tickets or prototypes to give engineers and designers an exact visual/data reference for the edit drawer, quick popover, and the most common Quick Update flows.*
