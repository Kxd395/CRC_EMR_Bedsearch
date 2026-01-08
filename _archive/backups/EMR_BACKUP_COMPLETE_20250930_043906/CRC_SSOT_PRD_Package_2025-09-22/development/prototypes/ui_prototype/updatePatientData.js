#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

console.log('Updating patient data in app.js...');

const appPath = './src/app.js';
let content = readFileSync(appPath, 'utf8');

// Find the start and end of the patientScenarios array
const startPattern = /const patientScenarios = \[/;
const endPattern = /  \];\s*\n\s*patientScenarios\.forEach\(\(scenario\) => {/;

const startMatch = content.search(startPattern);
const endMatch = content.search(endPattern);

if (startMatch === -1 || endMatch === -1) {
  console.error('Could not find patientScenarios array boundaries');
  process.exit(1);
}

// Replace the array with import
const replacement = `// Patient scenarios using real facility data from update2.md
  const patientScenarios = newPatientScenarios;

  patientScenarios.forEach((scenario) => {`;

const newContent = content.substring(0, startMatch) + replacement + content.substring(endMatch + endPattern.toString().length - 23); // Adjust for the forEach part

// Add import at the top
const importPattern = /import \{\n  facilityDirectory as facilityDirectoryData,\n  transformForFacilityFinder\n\} from '\.\/data\/facilityDirectory\.js';/;
const importReplacement = `import {
  facilityDirectory as facilityDirectoryData,
  transformForFacilityFinder
} from './data/facilityDirectory.js';
import { newPatientScenarios } from './data/newPatientScenarios.js';`;

const finalContent = newContent.replace(importPattern, importReplacement);

writeFileSync(appPath, finalContent);
console.log('Successfully updated app.js with new patient data!');