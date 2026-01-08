#!/usr/bin/env bash
# Apply the EMR schema using psql. Assumes EMR_DATABASE_URL is set.
set -euo pipefail

if [[ -z "${EMR_DATABASE_URL:-}" ]]; then
  echo "EMR_DATABASE_URL is not set. Export it or add it to your environment before running." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/schema/postgresql_emr_schema.sql"

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "Schema file not found at $SCHEMA_FILE" >&2
  exit 1
fi

psql "$EMR_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"

echo "Schema applied successfully."
