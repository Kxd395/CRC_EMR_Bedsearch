#!/usr/bin/env bash
set -euo pipefail

brew install postgresql@16 node@20 jq
brew services start postgresql@16 || true
createdb emr_local || true

psql emr_local -f db/migrations/2025_09_30_patients_jsonb_and_triggers.sql
psql emr_local -f db/migrations/2025_09_30_bed_search_constraints.sql

echo "Set VITE_API_URL to your API base (e.g., http://localhost:3001) before running the web app."
