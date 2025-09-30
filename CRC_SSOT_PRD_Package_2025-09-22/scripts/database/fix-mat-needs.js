#!/usr/bin/env node

// Fix MAT needs in newPatientScenarios.js
// Convert plain text strings to JSON objects

const fs = require('fs');
const path = require('path');

const filePath = '/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/src/web/src/data/newPatientScenarios.js';

console.log('🔧 Fixing MAT needs format in patient scenarios...');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Define the replacements
const replacements = {
  "matNeeds: 'MethadoneContinue'": "matNeeds: { type: 'MethadoneContinue', status: 'active' }",
  "matNeeds: 'MethadoneInduction'": "matNeeds: { type: 'MethadoneInduction', status: 'pending' }",
  "matNeeds: 'SuboxoneInduction'": "matNeeds: { type: 'SuboxoneInduction', status: 'pending' }",
  "matNeeds: 'SuboxoneContinue'": "matNeeds: { type: 'SuboxoneContinue', status: 'active' }",
  "matNeeds: 'None'": "matNeeds: {}"
};

// Apply all replacements
let changesMade = 0;
for (const [oldText, newText] of Object.entries(replacements)) {
  const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, newText);
    changesMade += matches.length;
    console.log(`✅ Replaced ${matches.length} instances of: ${oldText}`);
  }
}

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`🎉 Successfully updated ${changesMade} MAT needs entries in ${path.basename(filePath)}`);
console.log('📋 All MAT needs are now properly formatted as JSON objects.');