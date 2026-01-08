# RBAC & Field-Level Authorization (EMR)

## Roles
- **CRS (Certified Recovery Specialist):** Create/update bed searches, add notes/events; cannot edit demographics or insurance.
- **RN / Clinician:** All CRS permissions + update clinical fields (ASAM level, medical acuity).
- **Social Worker:** Update insurance/placement coordination; cannot change clinical status.
- **Attending:** Approve transfers, finalize placement; can select facility for transfer.
- **Supervisor:** Break-the-glass, redact events (via new redaction event), manage consents.
- **IT / Admin:** Manage users/roles; no access to PHI payloads by default (admin APIs are metadata-only).

## Field Guards (examples)
- `patients.asam_level`: RN/Attending only
- `patients.commitment_status`: RN/Social Worker/Attending
- `patients.searches[*].status`: CRS/RN/Social Worker (within assignment scope)
- `patients.searches[*].timeline`: append-only, all clinical roles
- Redaction events: Supervisor only

## Route Guards
- Mutations require session with role + patient assignment.
- Enforce **least privilege**; deny by default if role not mapped.

## Break-the-Glass
- Explicit justification field; generates immutable audit event
- Temporary elevated scope (time-boxed, patient-scoped)
- Auto-alert to supervisor; daily report to Privacy Officer
