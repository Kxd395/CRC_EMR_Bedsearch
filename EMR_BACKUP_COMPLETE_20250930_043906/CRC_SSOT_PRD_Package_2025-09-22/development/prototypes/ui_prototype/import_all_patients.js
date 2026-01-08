#!/usr/bin/env node
/**
 * Import all 32 patients from newPatientScenarios.js into PostgreSQL database
 */
import { newPatientScenarios } from './src/data/newPatientScenarios.js';

const API_BASE = 'http://localhost:3001/api';

console.log(`🔄 Starting migration of ${newPatientScenarios.length} patients to database...`);

async function importPatient(scenario) {
  // Convert scenario format to database patient format
  const patientData = {
    id: scenario.id,
    name: scenario.identifiers.name,
    mrn: scenario.identifiers.mrn,
    fin: scenario.identifiers.fin,
    dateOfBirth: '1990-01-01', // Default DOB
    firstName: scenario.identifiers.name.split(', ')[1] || '',
    lastName: scenario.identifiers.name.split(', ')[0] || '',
    status: 'Active',
    admissionStatus: scenario.note?.commitment || 'Voluntary',
    asamLevel: scenario.note?.asam || '',
    levelOfCare: scenario.note?.acuity || '',
    commitmentStatus: scenario.note?.commitment || '',
    medicalAcuity: scenario.note?.acuity || '',
    matNeeds: scenario.note?.matNeeds || {},
    insurancePrimary: 'Unknown',
    insuranceSecondary: '',
    bedRequest: scenario.note?.placementNeeded === 'Y',
    placementStatus: scenario.board?.statusKey || 'pending',
    assignedStaff: scenario.assignment?.id || '',
    lastUpdated: scenario.note?.lastUpdated || new Date().toISOString(),
    notes: scenario.note?.quickNotes || ''
  };

  try {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData)
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ ${scenario.identifiers.name} (${scenario.identifiers.mrn})`);
      
      // Also import assessment data if available
      if (scenario.note?.asam || scenario.note?.assessmentTs) {
        const assessmentData = {
          patientId: scenario.id,
          asamLevel: scenario.note.asam || '',
          levelOfCare: scenario.note.acuity || '',
          assessmentDate: scenario.note.assessmentTs || new Date().toISOString(),
          assessmentType: 'Initial',
          notes: scenario.note.quickNotes || ''
        };

        const assessmentResponse = await fetch(`${API_BASE}/patients/${scenario.id}/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assessmentData)
        });

        if (assessmentResponse.ok) {
          console.log(`   📋 Assessment data imported`);
        }
      }
    } else {
      console.log(`⚠️  ${scenario.identifiers.name}: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ ${scenario.identifiers.name}: ${error.message}`);
  }
}

// Import patients sequentially to avoid overwhelming the database
async function importAllPatients() {
  for (const scenario of newPatientScenarios) {
    await importPatient(scenario);
    // Small delay to prevent overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Migration complete!');
  
  // Verify final count
  try {
    const response = await fetch(`${API_BASE}/patients`);
    const result = await response.json();
    console.log(`📊 Total patients in database: ${result.count || result.data?.length || 0}`);
  } catch (error) {
    console.log('Could not verify final count');
  }
}

importAllPatients().catch(console.error);