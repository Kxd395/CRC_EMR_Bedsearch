/**
 * 🎭 Playwright Global Teardown  
 * Cleans up testing environment after E2E tests
 */

async function globalTeardown() {
  console.log('🧹 Cleaning up CRC SSOT EMR testing environment...');
  
  // Clean up test data
  try {
    await cleanupTestData(); 
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test data:', error.message);
  }
  
  console.log('🎭 Playwright teardown complete');
}

async function cleanupTestData() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api';
  
  // Clean up test facilities
  const testFacilityIds = [
    'test-facility-mh-1',
    'test-facility-sud-1'
  ];
  
  // Clean up test patients  
  const testPatientIds = [
    'test-patient-201',
    'test-patient-302', 
    'test-patient-303'
  ];
  
  // Delete test facilities
  for (const facilityId of testFacilityIds) {
    try {
      await fetch(`${baseUrl}/facilities/${facilityId}`, {
        method: 'DELETE'
      });
    } catch {
      // Ignore errors - test data cleanup is best effort
    }
  }
  
  // Delete test patients
  for (const patientId of testPatientIds) {
    try {
      await fetch(`${baseUrl}/patients/${patientId}`, {
        method: 'DELETE'
      });
    } catch {
      // Ignore errors - test data cleanup is best effort
    }
  }
}

export default globalTeardown;