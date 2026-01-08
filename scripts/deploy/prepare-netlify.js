#!/usr/bin/env node

/**
 * Netlify Deployment Helper
 * Prepares the CRC SSOT frontend for deployment to Netlify
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UI_DIR = path.join(__dirname, '../../src/web');

console.log('🚀 Preparing CRC SSOT for Netlify Deployment');
console.log('============================================');

// Check if we're in the right directory
if (!fs.existsSync(UI_DIR)) {
  console.error('❌ UI directory not found. Please run this from the project root.');
  process.exit(1);
}

// Change to UI directory
process.chdir(UI_DIR);

console.log('📁 Working directory:', UI_DIR);

// Check deployment mode
const args = process.argv.slice(2);
const deploymentMode = args[0] || 'static';

console.log('🔧 Deployment mode:', deploymentMode);

switch (deploymentMode) {
  case 'static':
    prepareStaticDeployment();
    break;
  case 'api':
    prepareApiDeployment();
    break;
  default:
    console.error('❌ Invalid deployment mode. Use: static or api');
    process.exit(1);
}

function prepareStaticDeployment() {
  console.log('\n📦 Preparing Static Deployment (No Backend)');
  
  // Create production environment file for static deployment
  const staticEnv = `
# Static deployment configuration (no backend)
VITE_API_URL=
VITE_NODE_ENV=production
VITE_USE_MOCK_DATA=true
VITE_ENABLE_DEBUG=false
`.trim();
  
  fs.writeFileSync('.env.production', staticEnv);
  console.log('✅ Created .env.production for static deployment');
  
  // Build the project
  console.log('🔨 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Static deployment ready!');
  console.log('📁 Deploy directory: dist/');
  console.log('🌐 The app will use mock data since no API is configured');
  console.log('\nNext steps:');
  console.log('1. Push your changes to GitHub');
  console.log('2. Connect repository to Netlify');
  console.log('3. Set build command: npm run build');
  console.log('4. Set publish directory: dist');
}

function prepareApiDeployment() {
  console.log('\n🌐 Preparing API-Connected Deployment');
  
  // Get API URL from user
  const apiUrl = process.env.NETLIFY_API_URL || 'https://your-api-domain.railway.app';
  
  // Create production environment file for API deployment
  const apiEnv = `
# API-connected deployment configuration
VITE_API_URL=${apiUrl}
VITE_NODE_ENV=production
VITE_USE_MOCK_DATA=false
VITE_ENABLE_DEBUG=false
`.trim();
  
  fs.writeFileSync('.env.production', apiEnv);
  console.log('✅ Created .env.production for API deployment');
  
  // Build the project
  console.log('🔨 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 API-connected deployment ready!');
  console.log('📁 Deploy directory: dist/');
  console.log(`🌐 API URL configured: ${apiUrl}`);
  console.log('\nNext steps:');
  console.log('1. Deploy your API to Railway/Render/Heroku');
  console.log('2. Update NETLIFY_API_URL environment variable');
  console.log('3. Push your changes to GitHub');
  console.log('4. Configure Netlify with your API URL');
  
  console.log('\nNetlify Environment Variables to set:');
  console.log(`VITE_API_URL=${apiUrl}`);
  console.log('VITE_NODE_ENV=production');
}

console.log('\n📋 Deployment Summary:');
console.log('- Build command: npm run build');
console.log('- Publish directory: dist');
console.log('- Node version: 18 (set in netlify.toml)');