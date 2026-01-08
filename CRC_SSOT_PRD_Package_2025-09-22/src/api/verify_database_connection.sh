#!/bin/bash

# Database Connection Verification Script
# Run this script to verify database connectivity and switch from fallback to database

echo "🔍 CRC SSOT Database Connection Verification"
echo "=========================================="

# Test 1: Direct PostgreSQL connection
echo "1️⃣  Testing direct PostgreSQL connection..."
psql -U emr_admin -d emr_crc_ssot -c "SELECT version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Direct database connection: SUCCESS"
    DB_DIRECT=true
else
    echo "❌ Direct database connection: FAILED"
    echo "   Error: $(psql -U emr_admin -d emr_crc_ssot -c "SELECT version();" 2>&1 | head -1)"
    DB_DIRECT=false
fi

echo ""

# Test 2: API Server Health Check
echo "2️⃣  Testing API server database connectivity..."
HEALTH_RESPONSE=$(curl -s "http://localhost:3001/api/health" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ API server: RUNNING"
    
    # Parse the health response
    DB_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"database":[^,]*' | cut -d: -f2)
    FALLBACK_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"fallback":[^,]*' | cut -d: -f2)
    
    echo "   Database connection: $DB_STATUS"
    echo "   Fallback active: $FALLBACK_STATUS"
    
    if [ "$DB_STATUS" = "true" ]; then
        echo "🎉 SUCCESS: API is using the database!"
    else
        echo "⚠️  WARNING: API is using fallback files"
    fi
else
    echo "❌ API server: NOT RESPONDING"
    echo "   Make sure the server is running on localhost:3001"
fi

echo ""

# Test 3: Make a test API call
echo "3️⃣  Testing patient data persistence..."
TEST_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/patients" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Patient", "mrn":"TEST123", "test":"verification"}' 2>/dev/null)

if [ $? -eq 0 ]; then
    METHOD=$(echo $TEST_RESPONSE | grep -o '"method":[^,]*' | cut -d: -f2 | tr -d '"')
    echo "✅ API call successful"
    echo "   Persistence method: $METHOD"
    
    if [ "$METHOD" = "database" ]; then
        echo "🎉 EXCELLENT: Data is being saved to the database!"
    else
        echo "⚠️  Data is being saved to fallback files"
    fi
else
    echo "❌ API call failed"
fi

echo ""
echo "📊 SUMMARY"
echo "========="

if [ "$DB_DIRECT" = true ] && [ "$DB_STATUS" = "true" ]; then
    echo "🎉 SUCCESS: Everything is running off the database correctly!"
    echo ""
    echo "✅ Direct database connection: Working"
    echo "✅ API database connection: Working"
    echo "✅ Data persistence: Database"
    echo ""
    echo "Your EMR system is now fully operational with PostgreSQL database."
    
elif [ "$DB_DIRECT" = true ] && [ "$DB_STATUS" != "true" ]; then
    echo "🔄 PARTIAL: Database is accessible but API needs restart"
    echo ""
    echo "✅ Direct database connection: Working"
    echo "❌ API database connection: Using fallback"
    echo ""
    echo "👉 ACTION REQUIRED: Restart the API server to pick up database connection:"
    echo "   kill \$(ps aux | grep 'node server.js' | grep -v grep | awk '{print \$2}')"
    echo "   cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api"
    echo "   nohup node server.js > server.log 2>&1 &"
    
else
    echo "❌ FAILED: Database connection issue persists"
    echo ""
    echo "❌ Direct database connection: Failed"
    echo "❌ API database connection: Using fallback"
    echo ""
    echo "👉 ACTION REQUIRED: Run the database fix script on the database server:"
    echo "   scp database_connection_fix.sh user@100.112.67.23:~/"
    echo "   ssh user@100.112.67.23"
    echo "   sudo bash ~/database_connection_fix.sh"
fi

echo ""