# EMR Bed Search — SSOT Additions (2025-09-29)

This pack adds **missing logic, mappings, policies, tests, and observability** for an EMR-grade bed-search persistence flow.

## What's included
- **Policies:** HIPAA/42 CFR Part 2, RBAC, logging redaction, local cache, retention
- **DB Migrations:** JSONB columns, timestamp trigger, partial unique indexes
- **API Specs & Middleware:** OpenAPI, idempotency + optimistic concurrency, server summary
- **Frontend:** LOC mapping, breadcrumbs, sync badge, persistence policy gate
- **Tests:** API contract & list/detail status parity, a11y guidance
- **Ops:** Metrics catalog, SIEM event list, threat model, macOS setup

## Apply (dev)
```bash
# macOS (Apple Silicon)
brew install postgresql@16 node@20 jq
brew services start postgresql@16
createdb emr_local

# Migrations
psql emr_local -f db/migrations/2025_09_30_patients_jsonb_and_triggers.sql
psql emr_local -f db/migrations/2025_09_30_bed_search_constraints.sql

# Node API
export NODE_ENV=development
# REQUIRED: export VITE_API_URL to your API base (e.g., http://localhost:3001)
npm run dev:api

# Frontend
npm run dev:web
```

> **Policy default:** Local PHI cache is **disabled by default**. Enable only if business-approved, with encryption and TTL (see `frontend/persistence/persistence-policy.ts`).
