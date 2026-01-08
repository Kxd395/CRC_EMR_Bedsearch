#!/usr/bin/env node

import http from 'http';

async function checkServerHealth() {
  console.log('🔍 Checking server health...');
  
  // Check UI server
  try {
    const uiResponse = await fetch('http://localhost:5173/');
    if (uiResponse.ok) {
      console.log('✅ UI Server: Running on localhost:5173');
    } else {
      console.log('❌ UI Server: Response error', uiResponse.status);
    }
  } catch (error) {
    console.log('❌ UI Server: Not accessible');
    console.log('   Try: cd development/prototypes/ui_prototype && npm run dev');
  }
  
  // Check API server
  try {
    const apiResponse = await fetch('http://localhost:3001/api/patients');
    if (apiResponse.ok) {
      const data = await apiResponse.text();
      console.log('✅ API Server: Running on localhost:3001');
      console.log('📊 Patient API responding');
    } else {
      console.log('❌ API Server: Response error', apiResponse.status);
    }
  } catch (error) {
    console.log('❌ API Server: Not accessible');
    console.log('   Error:', error.message);
    console.log('   Try: cd production/api && node server.js');
  }
  
  // Check if API server process exists
  try {
    const { exec } = await import('child_process');
    exec('ps aux | grep "node server.js" | grep -v grep', (error, stdout) => {
      if (stdout) {
        console.log('🔍 API Server process found');
      } else {
        console.log('🔍 No API Server process found');
      }
    });
  } catch (e) {
    // Ignore process check errors
  }
}

checkServerHealth().catch(console.error);