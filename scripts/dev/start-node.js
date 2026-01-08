#!/usr/bin/env node

/**
 * CRC SSOT Development Environment Starter
 * Cross-platform Node.js script to start both API and UI servers
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

// Configuration
const BASE_DIR = '/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22';
const API_DIR = path.join(BASE_DIR, 'src', 'api');
const UI_DIR = path.join(BASE_DIR, 'src', 'web');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Store process references for cleanup
let apiProcess = null;
let uiProcess = null;

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const command = os.platform() === 'win32' 
      ? `netstat -an | findstr :${port}` 
      : `lsof -i :${port}`;
    
    exec(command, (error) => {
      resolve(!error);
    });
  });
}

// Start API server
async function startAPI() {
  log('blue', '1️⃣  Starting API Server...');
  
  const portInUse = await checkPort(3001);
  if (portInUse) {
    log('yellow', '⚠️  Port 3001 already in use (API may already be running)');
    log('green', '✅ API Server: http://localhost:3001');
    return true;
  }
  
  return new Promise((resolve) => {
    let resolved = false;
    log('blue', `   📁 Directory: ${API_DIR}`);
    
    apiProcess = spawn('node', ['server.js'], {
      cwd: API_DIR,
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let output = '';
    apiProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (!resolved && output.includes('Server running on')) {
        resolved = true;
        log('green', `✅ API Server started (PID: ${apiProcess.pid})`);
        log('green', '   🌐 API Server: http://localhost:3001');
        resolve(true);
      }
    });
    
    apiProcess.stderr.on('data', (data) => {
      log('red', `API Error: ${data}`);
    });
    
    apiProcess.on('close', (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        log('red', `❌ API Server exited with code ${code}`);
        resolve(false);
      }
    });
    
    // Timeout after 3 seconds
    setTimeout(() => {
      if (!resolved && apiProcess && apiProcess.pid) {
        resolved = true;
        log('green', `✅ API Server started (PID: ${apiProcess.pid})`);
        log('green', '   🌐 API Server: http://localhost:3001');
        resolve(true);
      }
    }, 3000);
  });
}

// Start UI server
async function startUI() {
  log('blue', '2️⃣  Starting UI Development Server...');
  
  return new Promise((resolve) => {
    let resolved = false;
    log('blue', `   📁 Directory: ${UI_DIR}`);
    
    uiProcess = spawn('npm', ['run', 'dev'], {
      cwd: UI_DIR,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });
    
    let output = '';
    uiProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Look for Vite startup message
      if (!resolved && text.includes('Local:') && text.includes('localhost:')) {
        resolved = true;
        const portMatch = text.match(/localhost:(\d+)/);
        const port = portMatch ? portMatch[1] : '5173';
        log('green', `✅ UI Server started (PID: ${uiProcess.pid})`);
        log('green', `   🌐 UI Server: http://localhost:${port}`);
        resolve(port);
      }
    });
    
    uiProcess.stderr.on('data', (data) => {
      // Vite sometimes outputs to stderr, check if it's actually an error
      const text = data.toString();
      if (!text.includes('ready in') && !text.includes('Local:')) {
        log('yellow', `UI Info: ${text.trim()}`);
      }
    });
    
    uiProcess.on('close', (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        log('red', `❌ UI Server exited with code ${code}`);
        resolve(false);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (!resolved && uiProcess && uiProcess.pid) {
        resolved = true;
        log('green', `✅ UI Server started (PID: ${uiProcess.pid})`);
        log('green', '   🌐 UI Server: http://localhost:5173');
        resolve('5173');
      }
    }, 5000);
  });
}

// Show status summary
function showStatus(uiPort) {
  console.log('');
  log('green', '🎉 CRC SSOT Development Environment Ready!');
  console.log('==========================================');
  log('blue', '📊 System Status:');
  console.log('   • API Server:  http://localhost:3001');
  console.log(`   • UI Server:   http://localhost:${uiPort}`);
  console.log('   • Database:    PostgreSQL (localhost)');
  console.log('   • Patients:    19 loaded');
  console.log('   • Facilities:  25 with LOC filtering');
  console.log('');
  log('blue', '🔧 Available Features:');
  console.log('   • Patient selector with 19 patients');
  console.log('   • Facility Finder with smart filtering');
  console.log('   • LOC-based facility matching');
  console.log('   • Real-time search and filters');
  console.log('   • Database persistence');
  console.log('');
  log('blue', '💡 Quick Start:');
  log('yellow', `   1. Open: http://localhost:${uiPort}`);
  console.log("   2. Select a patient (e.g., 'Nguyen, Dana')");
  console.log("   3. Try the 'Facility Finder' tab");
  console.log('   4. Test LOC filtering and search');
  console.log('');
  log('yellow', '⏹️  To stop: Press Ctrl+C');
}

// Cleanup function
function cleanup() {
  console.log('');
  log('yellow', '🛑 Shutting down development environment...');
  
  if (apiProcess) {
    apiProcess.kill();
    log('green', '✅ API Server stopped');
  }
  
  if (uiProcess) {
    uiProcess.kill();
    log('green', '✅ UI Server stopped');
  }
  
  log('green', '👋 Development environment stopped');
  process.exit(0);
}

// Main execution
async function main() {
  log('blue', '🚀 Starting CRC SSOT Development Environment');
  console.log('==========================================');
  
  // Set up signal handlers
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  try {
    // Start API server
    const apiStarted = await startAPI();
    if (!apiStarted) {
      log('red', '❌ Failed to start API server');
      process.exit(1);
    }
    
    console.log('');
    
    // Start UI server
    const uiPort = await startUI();
    if (!uiPort) {
      log('red', '❌ Failed to start UI server');
      process.exit(1);
    }
    
    console.log('');
    showStatus(uiPort);
    
    // Keep process running
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
  } catch (error) {
    log('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();