#!/usr/bin/env node

/**
 * Quick validation script for the bed-search persistence updates
 * Tests the key behaviors without full Playwright overhead
 */

import http from 'http';

async function testPersistenceFlow() {
  console.log('🔍 Testing bed-search persistence updates...\n');

  // Test 1: UI Server Health Check
  try {
    const uiResponse = await makeRequest('http://localhost:5173/');
    console.log('✅ UI Server: Running on localhost:5173');
  } catch (error) {
    console.log('❌ UI Server: Not accessible on localhost:5173');
    console.log('   Try: npm run dev in ui_prototype/');
    return false;
  }

  // Test 2: API Server Health Check  
  try {
    const apiResponse = await makeRequest('http://localhost:3001/api/health');
    console.log('✅ API Server: Running on localhost:3001');
  } catch (error) {
    console.log('⚠️  API Server: Not accessible on localhost:3001');
    console.log('   Note: Tests will run in localStorage fallback mode');
  }

  // Test 3: Patient API Endpoint Structure & Persistence Validation
  try {
    const patientResponse = await makeRequest('http://localhost:3001/api/patients');
    const data = JSON.parse(patientResponse);
    
    if (data.success && Array.isArray(data.data)) {
      console.log('✅ Patient API: Returns structured data');
      console.log(`📊 Found ${data.count} patients via ${data.method || 'API'}`);
      
      if (data.method === 'database') {
        console.log('🎯 Persistence: Successfully using database instead of localStorage');
      }
      
      // Check if any patient has searchCount field (indicates bed search tracking)
      const hasSearchCounts = data.data.some(p => p.searchCount !== undefined);
      if (hasSearchCounts) {
        console.log('✅ Search Tracking: Patient searchCount field present');
      } else {
        console.log('⚠️  Search Tracking: searchCount field missing');
      }
    } else {
      console.log('❌ Patient API: Unexpected response structure');
      console.log('   Expected: {success: true, data: [...], method: "database"}');
      console.log('   Got keys:', Object.keys(data));
    }
  } catch (error) {
    console.log('❌ Patient API: Failed to fetch data -', error.message);
  }

  console.log('\n🎯 Persistence Update Validation Complete');
  return true;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

testPersistenceFlow().catch(console.error);