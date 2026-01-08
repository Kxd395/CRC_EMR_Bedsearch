# CRC SSOT / Facility Finder – Compliance Audit (Best-Effort)

## Executive Summary
- The checked-in materials are requirements, governance, and a static Epic-style prototype; no live Epic build, backend services, schemas, or CI assets are present.  
- Because operational code and environments are missing, all technical security, performance, and compliance checks could only be completed by inspection of specifications and the UI mock.  
- Key priority gaps: authoritative enums (MAT, ASAM/LoC, placement status) were divergent; PHI/Part 2 controls are defined but unenforced; audit trails, RBAC, consent enforcement, and retention policies have no implementation hooks; operational data-store decisions remain open.  
- Produced deliverables: repo inventory, contradictions analysis, patch aligning UI prototype enums/status palette to spec, placeholder SBOM/security outputs, and a roadmap for engaging Epic teams.

## Risk Heatmap
| Area | Risk | Rationale |
| --- | --- | --- |
| Privacy & Part 2 | Critical | No implementation available to validate segmentation, logging, redaction, or break-the-glass controls despite stringent requirements (07_Governance_and_Security_RACI.md, §Security & Privacy). |
| Access Control | Critical | RBAC/ABAC expectations exist but there is no code or config enforcing least privilege or consent gating. |
| Data Integrity | High | Operational data-store choice (Chronicles vs API) unresolved; directory stewardship workflow relies on manual processes and lacks integrity safeguards. |
| Performance | High | Finder latency SLAs (<2s) and throughput targets lack instrumentation or testing harness. |
| Testing & CI | High | No automated tests, coverage, linting, or CI present; only manual test scripts in 06_Test_Scripts.csv. |
| Observability | Medium | Audit trail and event logging requirements documented but no implementation to review. |
| Deployment | Medium | No infrastructure as code, pipelines, or environment configs surfaced; release path DEV→TEST→TRAIN→PROD remains conceptual. |

## Top 10 Issues
1. No executable EMR backend or Epic Chronicles build provided; cannot validate HIPAA/42 CFR Part 2 controls or data flows.  
2. MAT and Level of Care enumerations diverged between Field Dictionary and prototype (resolved in patch `PATCHES/fix-ui-enums.patch`).  
3. Placement statuses lacked canonical palette; inconsistent color semantics across UI and requirements (resolved in patch; script.js:1-59).  
4. Consent, RBAC, and break-the-glass requirements exist only on paper; no enforcement hooks present.  
5. Audit trail specification lacks schema/storage decisions; no evidence of tamper-evident logging.  
6. Finder scoring/validation rules (04_Rule_Specs_Validation_and_UDS.md) not implemented or testable.  
7. Toxicology trigger workflow relies on rules engine; no build artifacts or test coverage to review.  
8. Operational directory governance requires steward tooling; prototype has no CRUD or verification timestamp enforcement.  
9. Performance SLAs (<2s) and downtime playbook exist but no monitoring/alerting baselines.  
10. Supply-chain / SBOM requirements unmet—no package manifests, build scripts, or dependency management available.

## Contradictions Snapshot
| Topic | Source of Truth | Conflicting Artifact | Disposition |
| --- | --- | --- | --- |
| MAT enumerations | `02_Field_Dictionary_SDEs.csv` rows 4-5 | `ui_prototype/script.js:13-19` (pre-patch) | Updated via `PATCHES/fix-ui-enums.patch`; prototype now mirrors Field Dictionary. |
| Placement status palette | PRD §7, Audit instructions | `ui_prototype/script.js:22-59` (pre-patch) | Added canonical palette (Waiting/Sent, Accepted, Denied, NoBeds). |
| LoC options (ASAM) | PRD §6, instructions (LoC list) | `ui_prototype/script.js:2-10` | Prototype updated to expose canonical levels and acute codes. |
| Medical acuity enums | Field Dictionary row 6 | `script.js` data uses `Secured/StepUp/Routine` | Documented as open; requires Epic build alignment/migration. |
| Audit trail requirement | PRD §9; 05_Acceptance_Criteria #6 | Prototype lacks audit persistence | Flagged for Epic build scope—requires Chronicles or operational API logging. |
(Full detail in `CONTRADICTIONS.md`).

## Architecture Overview
**Current (as provided):** Static HTML/CSS/JS prototype illustrating Navigator layout, mock placement data, and UI behaviors; no integration to Epic, no backend. Requirements documents describe SmartForms, SDEs, Rules/BPA, and operational directory but without implementation assets.  
**Recommended:** Build within Epic (Chronicles + Hyperspace Navigator + BPA) per PRD, with governed operational API/Chronicles records, rules engine enforcement, In Basket routing, and Clarity/Caboodle analytics mirror. Introduce service boundary diagrams once actual repositories are supplied.

## Dependency Graph & SBOM
- No package manifests or build tooling provided. `_audit_out/security/` contains placeholder README detailing required scans (Semgrep, Bandit, Trivy) pending access to real code. `_audit_out/sbom/` documents inability to generate CycloneDX without package data.

## Security & Compliance Deep Dive
- **Segmentation & Break-the-Glass:** Requirements captured (07_Governance_and_Security_RACI.md) but not testable. Recommend Epic access review, Part 2 segmentation testing, and audit sampling once environments available.
- **Consent Enforcement:** Field dictionary enumerates flags (`PlacementNeeded`, `MAT_Needs`, consent booleans) yet prototype does not gate access. Add service-side interceptors validating consent scope on every read/write. 
- **PHI Logging & Redaction:** No logging pipeline present; plan for structured logging with redaction helpers (Epic audit + downstream data warehouse).  
- **Audit Trail:** Acceptance Criteria #6 demands full audit log; requires Chronicles event records and downstream reporting.  
- **Secrets & Config:** None supplied; ensure Epic config moved to secure environment variables/KeyVault equivalents.  
- **Data Retention & Deletion:** Policy absent; define retention schedule for SSOT notes, facility directory snapshots, and audit logs.  

## Performance & Reliability
- PRD NFRs set latency target (<2s typical, <5s p99). Recommend instrumentation in Navigator (Epic user logs) and directory service with query metrics.  
- Identify candidate indexes on operational store: `Facility (MAT flags, 302, acuity)` to support composite queries; `SDE` tables keyed by encounter + timestamps for trend reporting.  
- Establish regression budget tests once services exist (e.g., Semien-coded UI tests capturing response times, Dir query micro-benchmarks). 

## Testing & Coverage
- Only manual UAT scenarios exist (06_Test_Scripts.csv). No automated unit/integration/e2e or coverage reports.  
- Future Epic build should include: SmartForm rule unit tests, BPA/Rules regression harness, Navigator Cypress/playwright e2e, and reporting validation scripts.  
- CI must enforce lint, typecheck, tests, Semgrep, secret scan, and coverage thresholds per success criteria.

## Tooling & Actions Logged
- `_audit_out/repo_inventory.json` – repository inventory (languages, file counts).  
- `_audit_out/api_route_map.md` – Expected route/RBAC matrix derived from specs (mermaid data-flow).  
- `PATCHES/fix-ui-enums.patch` – Aligns prototype enums/status palette with canonical definitions.  
- `README_AUDIT_NOTES.md` – audit journal with timestamps.  
- Additional placeholder artifacts under `_audit_out/` documenting pending security scans, SBOM, coverage, and diagram requirements once code base is available.

## Next Steps / Dependencies
1. Engage Kevin Dial & Epic Build team for backend repository, Chronicles schema, and environment access.  
2. Import requirements into Epic work queues; trace enumerations and business rules to actual build tickets.  
3. Implement and validate RBAC, consent gating, audit logging, and PHI redaction once code is accessible.  
4. Generate real SBOM, security scan results, and coverage after code retrieval.  
5. Extend UI prototype to read from authoritative enums exported from Epic build to prevent future drift.
