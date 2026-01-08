#!/bin/bash
# Validate EMR Schema Deployment

source ./.env

echo "🏥 Validating EMR Schema..."

PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" << 'PSQL_EOF'
-- Check core tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('patients','facilities','placement_search','placement_notes')
ORDER BY table_name;

-- Check placement_status enum
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'placement_status')
ORDER BY enumlabel;

-- Check view
SELECT COUNT(*) as view_exists 
FROM information_schema.views 
WHERE table_name = 'v_active_placement_searches';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

\echo 'EMR Schema validation complete'
PSQL_EOF
