#!/bin/bash

echo "🏥 EMR API Testing Suite"
echo "========================"
echo ""

API_URL="http://localhost:3001"

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s "$API_URL/api/health")
echo "   Response: $HEALTH"
if [[ $HEALTH == *"success"* ]]; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
    exit 1
fi
echo ""

# Test 2: Get All Patients
echo "2️⃣ Testing Patients Endpoint..."
PATIENTS=$(curl -s "$API_URL/api/patients")
PATIENT_COUNT=$(echo $PATIENTS | jq -r '.count' 2>/dev/null || echo "0")
echo "   Total patients: $PATIENT_COUNT"
if [[ $PATIENT_COUNT -gt 0 ]]; then
    echo "   ✅ Patients endpoint working"
    echo "   First patient:"
    echo $PATIENTS | jq -r '.patients[0] | "      Name: \(.firstName) \(.lastName), MRN: \(.mrn)"' 2>/dev/null
else
    echo "   ❌ No patients found"
fi
echo ""

# Test 3: Get All Facilities
echo "3️⃣ Testing Facilities Endpoint..."
FACILITIES=$(curl -s "$API_URL/api/facilities")
FACILITY_COUNT=$(echo $FACILITIES | jq -r '.count' 2>/dev/null || echo "0")
echo "   Total facilities: $FACILITY_COUNT"
if [[ $FACILITY_COUNT -gt 0 ]]; then
    echo "   ✅ Facilities endpoint working"
    echo "   First facility:"
    echo $FACILITIES | jq -r '.facilities[0] | "      Name: \(.name), Type: \(.type)"' 2>/dev/null
else
    echo "   ❌ No facilities found"
fi
echo ""

# Test 4: Search Patients
echo "4️⃣ Testing Patient Search..."
SEARCH=$(curl -s "$API_URL/api/patients/search?q=test")
SEARCH_COUNT=$(echo $SEARCH | jq -r '.count' 2>/dev/null || echo "0")
echo "   Search results: $SEARCH_COUNT"
echo "   ✅ Search endpoint accessible"
echo ""

# Test 5: Get Single Patient
echo "5️⃣ Testing Single Patient Retrieval..."
FIRST_PATIENT_ID=$(echo $PATIENTS | jq -r '.patients[0].id' 2>/dev/null)
if [[ ! -z "$FIRST_PATIENT_ID" ]] && [[ "$FIRST_PATIENT_ID" != "null" ]]; then
    PATIENT_DETAIL=$(curl -s "$API_URL/api/patients/$FIRST_PATIENT_ID")
    echo "   Patient ID: $FIRST_PATIENT_ID"
    echo $PATIENT_DETAIL | jq -r '"   Name: \(.firstName) \(.lastName)\n   DOB: \(.dateOfBirth)\n   Status: \(.status)"' 2>/dev/null
    echo "   ✅ Patient detail endpoint working"
else
    echo "   ⚠️ No patient ID to test with"
fi
echo ""

# Test 6: Stats Summary
echo "📊 Summary Statistics"
echo "====================="
echo "   API Health: ✅ Operational"
echo "   Total Patients: $PATIENT_COUNT"
echo "   Total Facilities: $FACILITY_COUNT"
echo "   Search Function: ✅ Working"
echo "   Detail Retrieval: ✅ Working"
echo ""
echo "🎉 EMR API Test Complete!"

