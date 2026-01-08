#!/bin/bash
# Connect to EMR Database via Tailscale

source ./.env

echo "🏥 Connecting to EMR Database via Tailscale..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "⚠️  HIPAA Protected Health Information - Handle with Care"
echo ""

PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"
