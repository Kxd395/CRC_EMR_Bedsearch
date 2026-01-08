# CRC SSOT Placement Note + CRC Facility Finder — PRD v2 (ASAM & Acute BH)
**Date:** 2025-09-22  
**Owner/Sponsor:** Kevin J. Dial (CRC, Jefferson Einstein)  
**Directory Steward:** Brad (with delegate)  
**Clinical Leader:** Michael Furline (Director of Nursing, Behavioral Health CRC)

---

## 1. Problem Statement
CRC teams need a single, authoritative placement note and a governed, operational directory that accurately reflects **ASAM level-of-care capabilities**, **MAT**, **302 acceptance**, **medical & behavioral acuity**, and **dual-diagnosis** capacity. Incomplete signals create denials, delays, and safety/privacy risks.

## 2. Goals (delta from v1)
- Add first-class **ASAM capability** flags to the Facility Directory and match against **ASAM_REQUESTED** in the SSOT.
- Model **Acute Behavioral Health** needs (Acute/Secure) in SSOT and ensure facilities have corresponding capabilities.
- Preserve Part‑2 segmentation, auditability, and override governance.

## 3. Scope
In scope: SmartForm SSOT; Facility Finder; Rules/BPAs for ASAM/MAT/302/medical & behavioral acuity; UDS trigger; Storyboard/patient list; In Basket routing; governance & analytics.  
Out of scope: Changing the LOC/ASAM assessment instruments; external bed interfaces.

## 4. User Experience
- **Navigator: CRC Placement** — left: SSOT; right: **CRC Facility Finder**.
- **Badges:** ASAM list (e.g., “ASAM: 1.0,3.1”), **Acute Med Stab ✓/X**, **Acute BH ✓/X**, **Secure BH ✓/X**, **Dual Dx ✓/X**, **302 ✓/X**, **BH Med Init ✓/X**, **In‑Network**, **Staleness**.
- **Filters:** ASAM levels (multi-select), Acute Med Stab, Acute BH, Dual Diagnosis, BH Med Init, Accepts 302, payer in‑network.
- **Confirm/Warn/Block** modal shows exact reason and top alternatives. **Override** requires attestation + reason.

## 5. Data Model (visit SDEs & facility attributes)
**SSOT SDEs (visit-level)**  
- `SDE.CRC.RUNNOTE.ASAM_REQUESTED` (Code)  
- `SDE.CRC.RUNNOTE.ASAM_MATCHED` (Y/N)  
- `SDE.CRC.RUNNOTE.ASAM_MISMATCH_REASON` (Picklist/Text)  
- `SDE.CRC.RUNNOTE.MEDICAL_ACUITY_REQUIRED` (Low/Moderate/High)  
- `SDE.CRC.RUNNOTE.BEHAVIORAL_ACUITY_REQUIRED` (None/Observation/Acute/Secure)  
- `SDE.CRC.RUNNOTE.CO_OCCURRING_SMI` (Y/N)  
- `SDE.CRC.RUNNOTE.BH_MED_INITIATION_NEEDED` (Y/N)  
- `SDE.CRC.RUNNOTE.302_REQUIRED` (Y/N); `SDE.CRC.RUNNOTE.302_STATUS`  
- `SDE.CRC.RUNNOTE.FACILITY_SELECTED_ID` / `FACILITY_SELECTED_TS`  
- `SDE.CRC.RUNNOTE.REASSESS_FLAG` / `REASSESS_REASON`  
- Override metadata (Used/Reason/User)

**Facility Directory (operational store; mirrored to reporting)**
- `ASAM_LEVELS_AVAILABLE` (list), flags `ASAM_0_5`, `ASAM_1_0`, `ASAM_2_1`, `ASAM_2_5`, `ASAM_3_1`, `ASAM_3_7`, `ASAM_4_0`  
- `ACUTE_MEDICAL_STABILIZATION` (Y/N)  
- `ACUTE_BEHAVIORAL_HEALTH` (Y/N), `SECURE_BEHAVIORAL_CAPABLE` (Y/N)  
- `DUAL_DIAGNOSIS_CAPABLE` (Y/N), `BH_MED_INITIATION` (Y/N)  
- `TAKES_302` (Y/N), `SECURE_DETOX_CAPABLE` (Y/N)  
- `MEDICAL_ACUITY_CAPABILITY` (Low/Moderate/High)  
- `ASAM_CAPACITY_ESTIMATE` (e.g., InductionOnly/MaintenanceOnly/DetoxOnly/AllLevels)  
- Payer-plan network matrix, bed status, verification stamps

## 6. Decision Logic (summarized)
**ASAM match**: If `ASAM_REQUESTED ∈ ASAM_LEVELS_AVAILABLE` ⇒ proceed; else if higher level available ⇒ **Warn (HigherLevelAvailable)**; else **Block (FacilityDoesNotSupportLevel)**.  
**302**: If `302_REQUIRED=Y` and `TAKES_302=N` ⇒ **Block (302Mismatch)**.  
**Medical acuity**: If `MEDICAL_ACUITY_REQUIRED > MEDICAL_ACUITY_CAPABILITY` ⇒ **Warn/Block** per policy.  
**Behavioral acuity**: If `BEHAVIORAL_ACUITY_REQUIRED=Acute` and `ACUTE_BEHAVIORAL_HEALTH=N` ⇒ **Block**; if `Secure` and `SECURE_BEHAVIORAL_CAPABLE=N` ⇒ **Block**.  
**MAT**: Methadone/Suboxone induction/continue/detox must be supported; otherwise **Block**.  
**Ranking**: Match score boosted by recency & frequent acceptor; staleness decay 14/30 days.

## 7. UDS/Toxicology Event
As v1: new relevant analyte after assessment ⇒ `REASSESS_FLAG=Y`, banner, task to CRC Placement pool; finalize disabled until reassessed or overridden. Distinguish screen vs confirm; allow “not clinically impactful” dismissal with reason.

## 8. Security & Compliance
Part‑2 segmentation for SUD/tox; BTG gating; detailed audit for views/edits/overrides; role-limited directory editing.

## 9. Acceptance Criteria
See **05_Acceptance_Criteria.md** (includes C‑ASAM1..3 and ACUTE‑1..4).

## 10. KPIs
Denials, time-to-transfer, reassessment events, override rate & reasons, directory staleness, equity checks.

---
