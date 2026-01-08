# CRC SSOT Placement Note + CRC Facility Finder — Product Requirements Document (PRD)
**Date:** 2025-09-22  
**Owner/Sponsor:** Kevin J. Dial (CRC, Jefferson Einstein)  
**Directory Steward:** Brad (with delegate)  
**Clinical Leader:** Michael Furline (Director of Nursing, Behavioral Health CRC)

---

## 1. Problem Statement
CRC staff currently synthesize LOC/ASAM assessments, toxicology, and a patchwork of facility details (MAT, 302 acceptance, payer networks, medical acuity) to make time‑critical placement decisions. This leads to inconsistent outcomes, denials, delays, and privacy risk (SUD/Part‑2).

## 2. Goals & Non‑Goals
**Goals**
- Establish a single, authoritative, timestamped **CRC Unit Running Note** (SSOT) per visit.
- Provide a governed, **operational Facility Directory** embedded in workflow with fast search/filter.
- Enforce **decision checks** (MAT + LOC + 302 + acuity + payer) with confirm/warn/block and override audit.
- Trigger **reassessment** when relevant **toxicology** results post after assessment.
- Ensure **privacy** (HIPAA, 42 CFR Part 2) via segmentation, security points, and audit.
- Deliver measurable improvements: fewer denials, faster placements, better documentation.

**Non‑Goals**
- This PRD does not redesign LOC/ASAM assessments themselves.
- No use of Clarity/Caboodle for operational reads/writes.

## 3. Scope
**In Scope**: SmartForm, SDEs, Navigator component, Rules/BPA, Patient list columns, Storyboard banner, In Basket routing, Directory stewardship tooling, Operational data store/API, Analytics via Clarity/Caboodle mirror.  
**Out of Scope**: E‑signature procurement workflows, external bed interfaces beyond directory stewardship calls, portal build.

## 4. Stakeholders
- CRC front‑line staff (assessors, placement coordinators)
- Nursing leadership (Michael Furline)
- Directory Steward (Brad)
- Privacy/HIM, IT Security
- Lab Services, Revenue Cycle (payer network detail)
- Epic Build/Rules Team, Reporting/Analytics

## 5. User Experience
**Navigator:** “CRC Placement” section with two panels:  
1) **Running Note (SSOT)** – prefilled from latest visit LOC/ASAM; Quick Update (one line) writes SDEs; banner if reassessment required.  
2) **CRC Facility Finder** – filters (MAT type, 302, co‑occurring, acuity, payer, bed status); result cards with badges (verification staleness, payer, MAT), quick actions (Call | Send packet | Select).

**Patient List Columns:** PlacementNeeded, MAT_Needs, ReassessFlag, FacilitySelected, LastUpdatedTS.  
**Storyboard Banner:** “Reassess Required — new tox result.”

## 6. Data Model (summary)
**SSOT SDEs (visit‑level)** – see Field Dictionary; includes: PlacementNeeded, MAT_Needs, ASAM_Requested, Medical_Acuity_Required, CoOccurring_SMI, BH_Med_Initiation, 302_Required/Status, Facility_Selected_ID/TS, Reassess_Flag/Reason, Override metadata.  
**Toxicology** – analyte‑specific flags (methodology aware).  
**Facility Directory (operational)** – MAT flags (induction/continue/detox), 302 acceptance, co‑occurring capability, medical acuity capability, BH med initiation, payer‑plan network matrix, bed status (steward entered), verification stamps.

## 7. Decision Logic
**Rank score (0–100)** based on required attributes; staleness decay; confirm/warn/block outcomes; override requires reason/attestation. See Rule Specs.

## 8. Event Logic (Toxicology)
On new result posting after assessment timestamp for configured analytes (e.g., benzos, BAC, fentanyl, xylazine if available): set ReassessFlag, raise banner, In Basket to CRC Placement pool within ~2 minutes, soft‑pause transfer finalize.

## 9. Security & Compliance
- Segmentation & Break‑the‑Glass for SUD/tox elements; audited views/edits.  
- Directory editing restricted to Steward role; all changes stamped.  
- Scoped disclosures; e‑packet omits HIV/SUD unless policy/consent indicates necessity.

## 10. Non‑Functional Requirements (NFRs)
- Finder query latency < 2 seconds typical; 99th percentile < 5 seconds.  
- High availability; clear downtime plan (read‑only directory view; manual placement fallback).  
- Full auditability for edits, selections, overrides, and views.  
- Accessibility: keyboard navigable; readable at 125% scaling.

## 11. Reporting & KPIs
- Assessment→Selection→Finalize time; denial rates; override rates; reassessment events/resolutions; directory staleness; equity/safety metrics by MAT/302/payer.

## 12. Dependencies
- Lab analyte catalogs with methodology flags.  
- Payer→plan→network mappings.  
- In Basket pool configuration and security roles.

## 13. Release Plan
- **Phase 1:** SSOT SmartForm + Facility Finder + validation rules + UDS trigger (core analytes).  
- **Phase 2:** Payer plan details and advanced acuity flags; analytics dashboards.  
- **Phase 3:** Optional interfaces/automation for bed status, if available.

## 14. Acceptance Criteria
See “05_Acceptance_Criteria.md”.

## 15. Open Questions
- Final choice of operational store (Chronicles vs operational API).  
- Scope of co‑occurring and acuity definitions for consistent matching.

---
