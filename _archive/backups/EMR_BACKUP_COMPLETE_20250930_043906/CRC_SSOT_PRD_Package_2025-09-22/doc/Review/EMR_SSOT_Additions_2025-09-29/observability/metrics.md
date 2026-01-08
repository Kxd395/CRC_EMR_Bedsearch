# Metrics Catalog

- `save_latency_ms` (histogram): API PUT /patients latency
- `version_conflicts` (counter): 409 responses due to If-Match mismatch
- `idempotency_reused` (counter): 200 reused idempotent requests
- `event_apply_failures` (counter): DB txn errors after event append
- `local_cache_usage` (gauge): number of cached records in prod (should be zero)
- `fallback_writes_total` (counter): writes to fallback store

## Alerts
- `version_conflicts > 1% over 15m`
- `event_apply_failures > 0`
- `local_cache_usage > 0 in prod`
