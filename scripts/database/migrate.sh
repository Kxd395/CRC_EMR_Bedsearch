#!/bin/bash

# EMR Database Schema Migration Script
# Adds missing JSONB columns required for search functionality

echo "🔧 EMR Database Schema Migration"
echo "==============================="

DB_HOST="100.112.67.23"
DB_NAME="emr_crc_ssot"
DB_USER="emr_admin"
MIGRATION_FILE="remote_db_migration.sql"

echo "📋 Target Database: $DB_USER@$DB_HOST:5432/$DB_NAME"
echo "📄 Migration File: $MIGRATION_FILE"
echo ""

# Load password from .env
if [ -f "src/api/.env" ]; then
    DB_PASSWORD=$(grep "DB_PASSWORD=" src/api/.env | cut -d'=' -f2)
    echo "🔑 Database credentials loaded from .env"
else
    echo "❌ Cannot find src/api/.env file"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo ""
echo "🔍 Migration Preview:"
echo "--------------------"
head -20 "$MIGRATION_FILE"
echo "... (see $MIGRATION_FILE for full content)"
echo ""

# Test connection first
echo "🔗 Testing database connection..."
if command -v psql >/dev/null 2>&1; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Connection successful!"
        echo ""
        
        # Ask for confirmation
        echo "🚨 IMPORTANT: This will modify the production database schema"
        echo "   Adding JSONB columns: searches, search_history, mat_needs"
        echo "   This is REQUIRED for 'Add to Search' functionality to work"
        echo ""
        echo "📋 Migration will:"
        echo "   • Add missing JSONB columns to patients table"
        echo "   • Create GIN indexes for search performance"  
        echo "   • Initialize empty arrays for existing patients"
        echo "   • Enable proper search persistence"
        echo ""
        
        read -p "🔥 Proceed with schema migration? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "🚀 Executing migration..."
            
            # Execute the migration
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Migration completed successfully!"
                echo ""
                echo "🔍 Verifying new schema..."
                
                # Verify the columns were added
                PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
                    SELECT column_name, data_type, column_default 
                    FROM information_schema.columns 
                    WHERE table_name = 'patients' 
                    AND column_name IN ('searches', 'search_history', 'mat_needs')
                    ORDER BY column_name;
                "
                
                echo ""
                echo "🎉 Schema migration complete!"
                echo "   'Add to Search' functionality should now work properly"
                echo ""
                echo "🚀 Next steps:"
                echo "   1. Restart the API server: kill the node process and restart"
                echo "   2. Test 'Add to Search' → 'Publish to SSOT'"
                echo "   3. Data should now persist to database instead of fallback"
                
            else
                echo "❌ Migration failed!"
                echo "   Check the error messages above"
                exit 1
            fi
            
        else
            echo "❌ Migration cancelled by user"
            echo "   'Add to Search' will continue to fail until schema is updated"
            exit 1
        fi
        
    else
        echo "   ❌ Cannot connect to database"
        echo "   Error: IP address not whitelisted in pg_hba.conf"
        echo ""
        echo "🛠️  Two issues need to be resolved:"
        echo "   1. IP whitelist: Run ./update-database-whitelist.sh"
        echo "   2. Schema migration: This script (after IP is fixed)"
        echo ""
        echo "💡 Contact database administrator to:"
        echo "   • Add your IP (70.16.142.31) to pg_hba.conf"
        echo "   • Run this migration script"
        exit 1
    fi
    
else
    echo "❌ psql not installed"
    echo "   Install with: brew install postgresql"
    exit 1
fi