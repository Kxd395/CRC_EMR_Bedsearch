# Logging & Redaction Policy (HIPAA Security Rule)

## Zero-PII/PHI Logging
- Never log names, MRNs, phone numbers, addresses, full payloads.
- Allowed fields: request_id, route, role, patient_id_hash, outcome, latency, version, idempotency_key_hash.

## Redaction
- Server-side logger scrubs keys: `name`, `firstName`, `lastName`, `mrn`, `searches`, `history`, `events`, `note`, `contact`.
- If unexpected PHI leaks, trigger incident workflow and rotate sinks.

## Retention
- App logs: 30 days hot, 1 year cold (encrypted).
- Audit logs: minimum 6 years.

## SIEM Integration
- Stream structured JSON to SIEM; see `observability/siem_events.md` for event contracts.
