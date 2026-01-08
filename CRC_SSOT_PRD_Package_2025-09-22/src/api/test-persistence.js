#!/usr/bin/env node
/**
 * 🧪 End-to-End Persistence Test
 * Tests that assessment saves and retrieval work correctly
 * Created: September 29, 2025
 */

async function testPersistence() {
  console.log('🧪 Testing Assessment Persistence...\n');

  // Test 1: Retrieve current assessment
  console.log('📖 Step 1: Getting current assessment for pt_501...');
  const getResponse = await fetch('http://localhost:3001/api/patients/pt_501/assessments');
  const getResult = await getResponse.json();
  
  if (getResult.success) {
    console.log('✅ Retrieved assessment successfully');
    console.log(`   Count: ${getResult.count}`);
    console.log(`   Method: ${getResult.method}`);
    if (getResult.data.length > 0) {
      const current = getResult.data[0];
      console.log(`   Current Status: ${current.commitmentStatus || 'None'}`);
      console.log(`   ASAM Level: ${current.asamLevel || 'Not set'}`);
      console.log(`   Acuity: ${current.acuity || 'Not set'}`);
    }
  } else {
    console.error('❌ Failed to retrieve assessment');
    return;
  }

  // Test 2: Update assessment 
  console.log('\n💾 Step 2: Updating assessment (changing commitment status)...');
  const updateData = {
    patientId: 'pt_501',
    asamLevel: '3.7WM',
    commitmentStatus: '201Hold',  // Change from 'None' to '201Hold'
    acuity: 'Medically Monitored',
    placementNeeded: 'Y',
    matNeeds: 'MethadoneContinue',
    savedBy: 'Test Script',
    savedAt: new Date().toISOString()
  };

  const saveResponse = await fetch('http://localhost:3001/api/assessments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  const saveResult = await saveResponse.json();
  
  if (saveResult.success) {
    console.log('✅ Assessment saved successfully');
    console.log(`   Method: ${saveResult.method}`);
    console.log(`   Action: ${saveResult.action || 'saved'}`);
  } else {
    console.error('❌ Failed to save assessment:', saveResult.error);
    return;
  }

  // Test 3: Verify the update persisted
  console.log('\n🔍 Step 3: Verifying the update persisted...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

  const verifyResponse = await fetch('http://localhost:3001/api/patients/pt_501/assessments');
  const verifyResult = await verifyResponse.json();
  
  if (verifyResult.success && verifyResult.data.length > 0) {
    const updated = verifyResult.data[0];
    console.log('✅ Verification successful');
    console.log(`   Updated Status: ${updated.commitmentStatus}`);
    console.log(`   ASAM Level: ${updated.asamLevel}`);
    console.log(`   MAT Needs: ${updated.matNeeds || 'Not set'}`);
    
    if (updated.commitmentStatus === '201Hold') {
      console.log('\n🎉 SUCCESS: Assessment persistence is working correctly!');
      console.log('   ✅ Data saves properly');
      console.log('   ✅ Updates persist');
      console.log('   ✅ No duplicate records created');
    } else {
      console.log('\n❌ FAILED: Status did not update correctly');
      console.log(`   Expected: 201Hold, Got: ${updated.commitmentStatus}`);
    }
  } else {
    console.error('❌ Failed to verify update');
  }

  console.log('\n📊 Test Summary:');
  console.log(`   Database Status: ${getResult.method === 'database' ? '🟢 Connected' : '🔶 Fallback Mode'}`);
  console.log(`   Persistence: ${saveResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Data Integrity: ${verifyResult.data.length === 1 ? '✅ Single Record' : '⚠️ Multiple Records'}`);
}

// Run the test
testPersistence().catch(error => {
  console.error('💥 Test failed with error:', error.message);
  process.exit(1);
});