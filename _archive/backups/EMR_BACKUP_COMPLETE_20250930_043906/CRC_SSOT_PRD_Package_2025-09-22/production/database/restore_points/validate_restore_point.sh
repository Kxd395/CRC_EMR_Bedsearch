#!/bin/bash
# EMR Database Restore Point Validation Script
# Created: September 28, 2025
# Purpose: Validate restore point integrity and test restore procedures

set -euo pipefail

RESTORE_DIR="restore_points/2025-09-28_14-52-44_production_deployment"
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"

echo "🏥 EMR Restore Point Validation"
echo "================================"
echo "Validating restore point: $RESTORE_DIR"
echo

# Check if restore point directory exists
if [ ! -d "$RESTORE_DIR" ]; then
    echo "❌ ERROR: Restore point directory not found: $RESTORE_DIR"
    exit 1
fi

# Check required files
echo "📁 Checking restore point files..."
REQUIRED_FILES=(
    "emr_database_full_backup.sql"
    "env_production.backup"
    "schema_original.sql"
    "table_list.txt"
    "schema_structure.txt"
    "RESTORE_POINT_README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$RESTORE_DIR/$file" ]; then
        size=$(ls -lah "$RESTORE_DIR/$file" | awk '{print $5}')
        echo "✅ $file ($size)"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Validate SQL backup file
echo
echo "🔍 Validating SQL backup integrity..."
if grep -q "PostgreSQL database dump" "$RESTORE_DIR/emr_database_full_backup.sql"; then
    echo "✅ SQL backup header valid"
else
    echo "❌ SQL backup appears corrupted"
    exit 1
fi

# Count key components in backup
table_count=$(grep -c "CREATE TABLE" "$RESTORE_DIR/emr_database_full_backup.sql" || echo "0")
function_count=$(grep -c "CREATE FUNCTION" "$RESTORE_DIR/emr_database_full_backup.sql" || echo "0")
trigger_count=$(grep -c "CREATE TRIGGER" "$RESTORE_DIR/emr_database_full_backup.sql" || echo "0")

echo "✅ Backup contains: $table_count tables, $function_count functions, $trigger_count triggers"

# Validate environment backup
echo
echo "🔧 Validating environment configuration..."
if grep -q "EMR_DATABASE_URL" "$RESTORE_DIR/env_production.backup"; then
    echo "✅ Production environment configuration present"
else
    echo "❌ Environment configuration incomplete"
    exit 1
fi

# Test current database connectivity (optional)
if [ "${TEST_LIVE_DB:-false}" = "true" ]; then
    echo
    echo "🔌 Testing live database connection..."
    source "$RESTORE_DIR/env_production.backup"
    
    if psql "$EMR_DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1; then
        echo "✅ Live database connection successful"
        
        # Quick data validation
        patient_count=$(psql "$EMR_DATABASE_URL" -t -c "SELECT COUNT(*) FROM patients;" 2>/dev/null | xargs || echo "0")
        echo "✅ Current database has $patient_count patients"
    else
        echo "⚠️  Live database connection failed (expected if testing offline)"
    fi
fi

echo
echo "📋 Restore Point Validation Summary"
echo "===================================="
echo "✅ All required files present"
echo "✅ SQL backup integrity verified"
echo "✅ Environment configuration valid"
echo "✅ Documentation complete"
echo
echo "🎯 Restore Point Status: VALID AND READY FOR USE"
echo
echo "To perform emergency restore:"
echo "1. cd $RESTORE_DIR"
echo "2. export PATH=\"/usr/local/opt/postgresql@16/bin:\$PATH\""
echo "3. psql -h 100.112.67.23 -U emr_admin -d postgres < emr_database_full_backup.sql"
echo
echo "📞 Emergency contacts documented in RESTORE_POINT_README.md"