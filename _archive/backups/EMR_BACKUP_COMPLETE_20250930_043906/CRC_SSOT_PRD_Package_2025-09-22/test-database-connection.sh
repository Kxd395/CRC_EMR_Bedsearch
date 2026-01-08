#!/bin/bash

###############################################################################
# Quick Database Connection Test
# Tests connection to your production database at 100.112.67.23
###############################################################################

echo "🔍 Testing database connection to 100.112.67.23:5432..."
echo ""

# Test 1: Network connectivity
echo "1️⃣  Testing network connectivity..."
if nc -z -w5 100.112.67.23 5432 2>/dev/null; then
    echo "   ✅ Port 5432 is reachable"
else
    echo "   ❌ Cannot reach port 5432 on 100.112.67.23"
    echo "   Check your network connection or firewall settings"
    exit 1
fi

# Test 2: PostgreSQL connection using psql (if available)
echo ""
echo "2️⃣  Testing PostgreSQL connection..."
if command -v psql &> /dev/null; then
    PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT COUNT(*) as patient_count FROM patients;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "   ✅ Database connection successful"
    else
        echo "   ⚠️  Could not query database (auth or permissions issue)"
    fi
else
    echo "   ⚠️  psql not installed, skipping direct database test"
fi

# Test 3: API server test
echo ""
echo "3️⃣  Testing via API server..."
echo "   Starting API server..."

cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api

# Start API server temporarily
node server.js > /tmp/api-test.log 2>&1 &
API_PID=$!

sleep 5

# Test health endpoint
HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo "   ✅ API server responding"
    echo ""
    echo "   Health Status:"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    
    # Get patient count
    echo ""
    echo "   Patient Data:"
    PATIENTS=$(curl -s http://localhost:3001/api/patients 2>/dev/null)
    PATIENT_COUNT=$(echo "$PATIENTS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    echo "   📊 Total patients: $PATIENT_COUNT"
else
    echo "   ❌ API server not responding"
    echo "   Check logs at: /tmp/api-test.log"
fi

# Cleanup
kill $API_PID 2>/dev/null
sleep 1
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ Database connection test complete"
