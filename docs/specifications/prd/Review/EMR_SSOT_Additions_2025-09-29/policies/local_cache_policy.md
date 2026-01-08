# Local Cache Policy (Default OFF)

- Default: disabled in production.
- If enabled (explicit business approval):
  - **Encrypt at rest** (AES-GCM via WebCrypto)
  - **TTL:** 24h purge
  - **Scope:** Only minimal fields needed for offline queueing
  - **Remote wipe:** Clear cache on logout/device unpair
  - **Config flag:** `CRC_ENABLE_LOCAL_CACHE=1`

See `frontend/persistence/persistence-policy.ts` for the enforcement hook.
