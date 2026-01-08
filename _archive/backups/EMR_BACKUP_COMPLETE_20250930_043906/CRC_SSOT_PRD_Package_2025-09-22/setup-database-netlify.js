#!/usr/bin/env node

/**
 * Setup Netlify to use your existing database
 * This creates a production build that connects to your deployed API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UI_DIR = path.join(__dirname, 'development', 'prototypes', 'ui_prototype');

console.log('🔌 Setting up Netlify with Your Real Database');
console.log('===========================================');

// Get deployment options
const args = process.argv.slice(2);
let apiUrl = args[0];

if (!apiUrl) {
  console.log('\n📋 Options to connect your real database:');
  console.log('1. 🚂 Deploy API to Railway (with your PostgreSQL)');
  console.log('2. 🌐 Use ngrok tunnel (for testing)');
  console.log('3. ☁️  Migrate to cloud database');
  console.log('\n💡 For testing, ngrok is quickest!');
  
  // For now, let's set up for Railway deployment
  console.log('\n🚂 Setting up for Railway deployment...');
  apiUrl = 'https://your-crc-api.railway.app'; // Placeholder
}

// Change to UI directory
process.chdir(UI_DIR);

console.log(`📁 Working in: ${UI_DIR}`);
console.log(`🌐 API URL: ${apiUrl}`);

// Create production environment file for database connection
const databaseEnv = `
# Database-connected deployment
VITE_API_URL=${apiUrl}
VITE_NODE_ENV=production
VITE_USE_MOCK_DATA=false
VITE_ENABLE_DEBUG=false
`.trim();

fs.writeFileSync('.env.production', databaseEnv);
console.log('✅ Created .env.production for database connection');

// Build the project
console.log('\n🔨 Building project for database integration...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Database-connected build ready!');
console.log('📁 Deploy directory: dist/');
console.log(`🔌 Connected to: ${apiUrl}`);

console.log('\n🚀 Next Steps:');

if (apiUrl.includes('railway')) {
  console.log('1. 📤 Deploy your API to Railway:');
  console.log('   - Go to https://railway.app');
  console.log('   - Create new project from GitHub');
  console.log('   - Add PostgreSQL service');
  console.log('   - Set start command: cd production/api && node server.js');
  console.log('   - Import your 19 patients to Railway database');
  
  console.log('\n2. 🔄 Update Netlify environment:');
  console.log('   - Replace placeholder URL with real Railway URL');
  console.log('   - Rebuild and deploy to Netlify');
} else {
  console.log('1. ✅ Your API is configured');  
  console.log('2. 📤 Deploy to Netlify with your database connection');
}

console.log('\n📊 What you\'ll get on Netlify:');
console.log('✅ All 19 patients from your database');
console.log('✅ Real facility data with LOC filtering');
console.log('✅ Full persistence and CRUD operations');
console.log('✅ Complete CRC SSOT functionality');

console.log('\n🔧 Netlify Configuration:');
console.log('- Base directory: development/prototypes/ui_prototype');
console.log('- Build command: npm run build');
console.log('- Publish directory: dist');
console.log(`- Environment variable: VITE_API_URL=${apiUrl}`);