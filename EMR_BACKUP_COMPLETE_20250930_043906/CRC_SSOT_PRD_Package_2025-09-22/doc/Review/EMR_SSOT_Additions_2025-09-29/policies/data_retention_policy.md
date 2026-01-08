# Data Retention & Deletion

- **Patients table:** Retain as medical record per org policy; apply legal hold when required.
- **Audit / event store:** ≥ 6 years.
- **Local caches:** 24h TTL maximum; must be encrypted. Auto-purge on next launch.
- **Backups:** Daily full, 15-min WAL shipping; **RPO ≤ 15 min**, **RTO ≤ 4 h**.
- **Right to correct:** Provide amendment path; do not delete audit records—append correction events.
