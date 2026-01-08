import { newPatientScenarios } from './src/data/newPatientScenarios.js';

// Simulate the ensureFacilitySearch logic
function ensureFacilitySearch(patient, facilityId) {
  if (!patient.searches) patient.searches = [];
  
  const existing = patient.searches.find(search => search.facilityId === facilityId);
  if (existing) {
    return { search: existing, created: false };
  }
  
  const fresh = {
    id: `${facilityId}-${Date.now()}`,
    facilityId,
    facilityName: facilityId,
    status: 'Searching'
  };
  patient.searches.push(fresh);
  return { search: fresh, created: true };
}

// Test with first patient
const testPatient = JSON.parse(JSON.stringify(newPatientScenarios[0])); // Deep copy
console.log(`Testing with patient FIN: ${testPatient.identifiers.fin}`);
console.log(`Initial searches: ${testPatient.searches.length}`);

// Try to add same facility twice (simulating two users)
const result1 = ensureFacilitySearch(testPatient, 'EAGLEVILLE');
console.log(`First add - Created: ${result1.created}, Search ID: ${result1.search.id}`);

const result2 = ensureFacilitySearch(testPatient, 'EAGLEVILLE');
console.log(`Second add - Created: ${result2.created}, Search ID: ${result2.search.id}`);

console.log(`Final searches: ${testPatient.searches.length}`);
console.log(`Same search object: ${result1.search === result2.search}`);

// Test different facility
const result3 = ensureFacilitySearch(testPatient, 'KIRKBRIDE');
console.log(`Different facility - Created: ${result3.created}, Search ID: ${result3.search.id}`);
console.log(`Total searches: ${testPatient.searches.length}`);