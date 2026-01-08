# Rule Specs — Validation (ASAM, MAT, 302, Medical & Behavioral Acuity) + UDS Trigger

## 1) Facility Selection Validation (summary)
Inputs: SSOT SDEs (ASAM_REQUESTED, MAT_NEEDS, MEDICAL_ACUITY_REQUIRED, BEHAVIORAL_ACUITY_REQUIRED, 302_REQUIRED), Facility attributes (ASAM flags, ACUTE_MEDICAL_STABILIZATION, ACUTE_BEHAVIORAL_HEALTH, SECURE_BEHAVIORAL_CAPABLE, TAKES_302, MEDICAL_ACUITY_CAPABILITY, MAT flags, payer matrix).

Outcomes: **Confirm** | **Warn** (show reason & alternatives) | **Block** (requires override with attestation & reason).

## 2) ASAM / Level-of-Care Matching (pseudo-BPA)
Let:
- patient_level = SDE.CRC.RUNNOTE.ASAM_REQUESTED
- facility_levels = facility.ASAM_LEVELS_AVAILABLE (list)
- facility_acuity = facility.MEDICAL_ACUITY_CAPABILITY
- patient_acuity = SDE.CRC.RUNNOTE.MEDICAL_ACUITY_REQUIRED
- requires_302 = SDE.CRC.RUNNOTE.302_REQUIRED

Pseudo-logic:
IF requires_302 == Y AND facility.TAKES_302 != Y
    OUTCOME = BLOCK; REASON = "302Mismatch"
ELSE IF patient_level IN facility_levels
    IF patient_acuity <= facility_acuity OR facility.ACUTE_MEDICAL_STABILIZATION == Y
        OUTCOME = CONFIRM; set ASAM_MATCHED=Y
    ELSE
        OUTCOME = WARN; REASON = "AcuityConcern"; set ASAM_MATCHED=Y
ELSE
    IF exists level_higher IN facility_levels where level_higher >= patient_level
        OUTCOME = WARN; REASON = "HigherLevelAvailable"; set ASAM_MATCHED=Y
    ELSE
        OUTCOME = BLOCK; REASON = "FacilityDoesNotSupportLevel"; set ASAM_MATCHED=N

Also combine with MAT validation and payer network policy before final outcome.

## 3) Behavioral Health Acuity Matching (pseudo-BPA)
Let:
- behavioral_need = SDE.CRC.RUNNOTE.BEHAVIORAL_ACUITY_REQUIRED (None|Observation|Acute|Secure)

Logic:
IF behavioral_need IN (None, Observation)
    proceed (no BH hard requirement)
ELSE IF behavioral_need == Acute AND facility.ACUTE_BEHAVIORAL_HEALTH != Y
    OUTCOME = BLOCK; REASON = "Facility lacks Acute Behavioral Health capability"
ELSE IF behavioral_need == Secure AND facility.SECURE_BEHAVIORAL_CAPABLE != Y
    OUTCOME = BLOCK; REASON = "Facility lacks Secure Behavioral capability"

Record mismatch in SDE.CRC.RUNNOTE.BEHAVIORAL_MISMATCH_REASON when applicable.

## 4) MAT Validation (unchanged from v1)
- MethadoneInduction/Continue/Detox and SuboxoneInduction/Continue/Detox must be supported by facility flags; otherwise BLOCK.

## 5) UDS/Toxicology Trigger (unchanged from v1)
Trigger: New relevant analyte result time > ASSESSMENT_TS.  
Actions: Set REASSESS_FLAG=Y + banner; In Basket to CRC Placement Pool; disable finalize until reassessed or overridden. Distinguish screen vs confirm; allow dismissal with reason.

## 6) Ranking & Alternatives
Score 0–100 combining ASAM, MAT, 302, acuity, payer. Decay for staleness (>14d, >30d). Boost for frequent acceptor. Display top 3 alternatives on Warn/Block.
