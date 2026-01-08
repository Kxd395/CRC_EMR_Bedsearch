# Rule Specs — Validation & UDS Trigger

## 1) Facility Selection Validation
**Inputs:** SDE.CRC.RUNNOTE.MAT_NEEDS; SDE.CRC.RUNNOTE.ASAM_REQUESTED; SDE.CRC.RUNNOTE.MEDICAL_ACUITY_REQUIRED; SDE.CRC.RUNNOTE.302_REQUIRED; Facility attributes (MAT flags; TAKES_302; MEDICAL_ACUITY_CAPABILITY; PAYER_PLAN_MATRIX).

**Logic:**
- Compute match score (0–100). Hard conflicts ⇒ Block; soft conflicts ⇒ Warn.
- Hard conflicts: MAT required but unsupported; 302 required but TAKES_302=No; required acuity > facility capability; payer out‑of‑network when policy mandates in‑network.
- Soft conflicts: stale verification (>14 days), conditional payer acceptance, unknown bed status.

**Actions:**
- Confirm: write FACILITY_SELECTED_ID/TS.
- Warn: show reason + top 3 alternatives; allow proceed.
- Block: require override (capture OVERRIDE_USED=Y, OVERRIDE_REASON, OVERRIDE_USER_ID).

## 2) UDS/Toxicology Trigger
**Trigger:** New lab result with result time > SDE.CRC.RUNNOTE.ASSESSMENT_TS for configured analytes (e.g., benzos, BAC above threshold, fentanyl, xylazine if available).

**Actions:**
1. Set SDE.CRC.RUNNOTE.REASSESS_FLAG=Y and set REASSESS_REASON.
2. Display Storyboard banner: “Reassess Required — new tox result.”
3. In Basket to CRC Placement Pool and assigned assessor within ~2 minutes.
4. Soft‑pause finalize step in transfer SmartForm (or require override).

**Safeguards:**
- Distinguish screen vs confirm methodology; allow “Not clinically impactful” dismissal with reason; auto‑clear on confirmatory negative.
