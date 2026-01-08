# 42 CFR Part 2 Segmentation & Consent

## Scope
Substance Use Disorder (SUD) information is **Part 2-protected**. Redisclosure requires patient consent except in emergencies.

## Data Segmentation
- Tag SUD-related fields/events with `part2: true` (e.g., diagnoses, SUD treatment facility info).
- Store consents with scope (recipient, purpose, expiration).

## Access Controls
- Deny access to Part 2 data unless:
  - User has role with Part 2 scope **and**
  - Active consent covers requested data **or**
  - Emergency access ("break-the-glass") is invoked and audited

## Redisclosure Controls
- Outbound payloads (fax/API/export) must filter Part 2-tagged fields unless consent authorizes disclosure.
- Attach redisclosure notice when disclosing.

## Auditing
- Log each access to Part 2 data: user, timestamp, purpose, consent ID.
- Monthly attestations to Privacy Officer with access anomalies flagged.
