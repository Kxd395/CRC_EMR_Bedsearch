# Acceptance Criteria (v2 — ASAM & Acute BH)

Core (v1) criteria remain and are supplemented with the following:

## ASAM
- **C-ASAM1:** When ASAM_REQUESTED = 3.1, filtering ASAM=3.1 returns only facilities where ASAM_3_1=Y.
- **C-ASAM2:** If facility lacks requested ASAM but has a higher level (e.g., 3.7 for 3.1), selection yields **Warn** with reason "HigherLevelAvailable"; user may proceed or choose alternative.
- **C-ASAM3:** If 302_REQUIRED=Y and TAKES_302=N, selection is **Blocked** with reason "302Mismatch".
- **C-ASAM4:** If ASAM_REQUESTED=4.0 and facility supports only 3.1, selection is **Blocked** with reason "FacilityDoesNotSupportLevel".

## Acute Behavioral Health
- **ACUTE-1:** If BEHAVIORAL_ACUITY_REQUIRED=Acute and ACUTE_BEHAVIORAL_HEALTH=N, selection is **Blocked**; reason recorded in BEHAVIORAL_MISMATCH_REASON.
- **ACUTE-2:** If BEHAVIORAL_ACUITY_REQUIRED=Secure and SECURE_BEHAVIORAL_CAPABLE=N, selection is **Blocked**.
- **ACUTE-3:** Finder filter Acute Behavioral Health returns only facilities with ACUTE_BEHAVIORAL_HEALTH=Y.
- **ACUTE-4:** Override is role-gated; audit captures reason and user.

## Combined
- **COMB-1:** Patient needs ASAM 3.1 + Acute BH; facility supports 3.1 but lacks ACUTE_BEHAVIORAL_HEALTH ⇒ **Blocked** with BH reason; alternatives suggested.
- **COMB-2:** Patient MAT need = MethadoneContinue; facility lacks METHADONE_CONTINUE ⇒ **Blocked** even if ASAM matches.
