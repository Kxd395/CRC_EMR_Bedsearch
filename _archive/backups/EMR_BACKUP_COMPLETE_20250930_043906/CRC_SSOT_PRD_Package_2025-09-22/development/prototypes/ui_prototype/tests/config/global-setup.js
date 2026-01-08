/**
 * 🎭 Playwright Global Setup
 * Prepares the testing environment for healthcare E2E testing
 */

async function globalSetup() {
  console.log('🏥 Setting up CRC SSOT EMR testing environment...');
  
  // Wait for API server to be ready
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        console.log('✅ API server is ready');
        break;
      }
    } catch (error) {
      retries++;
      console.log(`⏳ Waiting for API server... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (retries === maxRetries) {
    throw new Error('❌ API server failed to start within timeout period');
  }
  
  // Setup test database state
  try {
    await setupTestData();
    console.log('✅ Test data initialized');
  } catch (error) {
    console.warn('⚠️ Could not initialize test data:', error.message);
  }
  
  console.log('🎭 Playwright setup complete');
}

async function setupTestData() {
  // Create test facilities
  const facilities = [
    {
      id: 'test-facility-mh-1',
      name: 'Test Mental Health Center', 
      type: 'mental-health',
      acceptsCommitmentTypes: ['201', '302', '303'],
      capacity: 50,
      availableBeds: 10
    },
    {
      id: 'test-facility-sud-1', 
      name: 'Test SUD Treatment Center',
      type: 'substance-use',
      acceptsCommitmentTypes: [], // SUD uses different pathways
      capacity: 30,
      availableBeds: 5
    }
  ];
  
  // Create test patients with different commitment types
  const patients = [
    {
      id: 'test-patient-201',
      firstName: 'John',
      lastName: 'Voluntary',
      commitmentType: '201',
      assessmentStatus: 'completed'
    },
    {
      id: 'test-patient-302',
      firstName: 'Jane', 
      lastName: 'Emergency',
      commitmentType: '302',
      assessmentStatus: 'in-progress'
    },
    {
      id: 'test-patient-303',
      firstName: 'Bob',
      lastName: 'Extended',
      commitmentType: '303', 
      assessmentStatus: 'pending'
    }
  ];
  
  // Send test data to API (if available)
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api';
  
  for (const facility of facilities) {
    try {
      await fetch(`${baseUrl}/facilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facility)
      });
    } catch (error) {
      // Ignore errors - fallback system will handle
    }
  }
  
  for (const patient of patients) {
    try {
      await fetch(`${baseUrl}/patients`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
    } catch (error) {
      // Ignore errors - fallback system will handle
    }
  }
}

export default globalSetup;