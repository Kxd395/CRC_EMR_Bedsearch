# SIEM Event Contracts

- `patient.save` — { patient_id_hash, version_after, method: 'db'|'fallback', user_id_hash, request_id }
- `patient.conflict` — { patient_id_hash, expected, actual, user_id_hash, request_id }
- `btg.invoked` — break-the-glass invoked with justification (no PHI)
- `part2.access` — SUD data access with consent_id or emergency rationale
