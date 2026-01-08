# Threat Model (STRIDE)

- **Spoofing:** Session fixation, stolen tokens → Mitigate with short-lived tokens, HTTPS-only cookies, IP/device binding.
- **Tampering:** Payload alteration → OCC (If-Match), idempotency, server-side validation, audit hash chain (optional).
- **Repudiation:** Deny action → Structured audit with request_id, user_id_hash, immutable event store.
- **Information Disclosure:** PHI in logs/cache → Redaction policy, encrypted local cache (off by default).
- **Denial of Service:** Retry storms → Rate limits per user/IP, backoff on 409/5xx, idempotency dedupe.
- **Elevation of Privilege:** Path traversal/role abuse → RBAC/ABAC, Break-the-Glass gating, code-level field guards.
