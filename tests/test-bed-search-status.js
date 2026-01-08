const { test, expect } = require('@playwright/test');

test.describe('Bed Search Status Change', () => {
  test('should change bed search status and update color badge', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174');
    
    // Wait for app to load
    await page.waitForSelector('#patientSelect', { timeout: 10000 });
    
    // Wait for database to load
    await page.waitForFunction(() => {
      const logs = performance.getEntriesByType('mark');
      return Array.from(document.querySelectorAll('.search-row')).length > 0;
    }, { timeout: 10000 });
    
    console.log('✅ App loaded');
    
    // Select pt_501 (Dana Nguyen)
    await page.selectOption('#patientSelect', 'pt_501');
    await page.waitForTimeout(1000);
    
    console.log('✅ Selected pt_501');
    
    // Find all bed searches
    const searchRows = await page.locator('.search-row').all();
    console.log(`📋 Found ${searchRows.length} bed searches`);
    
    // Find a "Searching" status bed search
    let searchingRow = null;
    let facilityName = null;
    
    for (const row of searchRows) {
      const badge = await row.locator('.status-badge').first();
      const badgeText = await badge.textContent();
      
      if (badgeText.includes('Searching')) {
        searchingRow = row;
        facilityName = await row.locator('.search-facility').textContent();
        console.log(`🔍 Found "Searching" bed search: ${facilityName}`);
        break;
      }
    }
    
    if (!searchingRow) {
      console.log('⚠️ No "Searching" bed searches found - all may already be processed');
      return;
    }
    
    // Check initial badge color (should be yellow/orange - badge-waiting)
    const initialBadge = await searchingRow.locator('.status-badge').first();
    const initialClass = await initialBadge.getAttribute('class');
    console.log(`🎨 Initial badge class: ${initialClass}`);
    expect(initialClass).toContain('badge-waiting');
    
    // Click "View details" button to open drawer
    const viewDetailsBtn = await searchingRow.locator('button:has-text("View details")');
    await viewDetailsBtn.click();
    await page.waitForTimeout(500);
    
    console.log('✅ Opened facility drawer');
    
    // Wait for drawer to be visible
    await page.waitForSelector('#facilityDrawer:not(.hidden)', { timeout: 5000 });
    
    // Change status dropdown to "Accepted"
    await page.selectOption('#drawerStatus', 'Accepted');
    console.log('✅ Changed status to "Accepted"');
    
    // Click "Save changes" button
    const saveBtn = await page.locator('#drawerSaveChanges, #drawerSave').first();
    await saveBtn.click();
    
    console.log('✅ Clicked save button');
    
    // Wait for drawer to close
    await page.waitForSelector('#facilityDrawer.hidden', { timeout: 5000 });
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Find the same facility again and check badge color
    const updatedRow = await page.locator(`.search-row:has-text("${facilityName}")`).first();
    const updatedBadge = await updatedRow.locator('.status-badge').first();
    const updatedClass = await updatedBadge.getAttribute('class');
    const updatedText = await updatedBadge.textContent();
    
    console.log(`🎨 Updated badge class: ${updatedClass}`);
    console.log(`🎨 Updated badge text: ${updatedText}`);
    
    // Verify badge changed to green (badge-accepted)
    expect(updatedClass).toContain('badge-accepted');
    expect(updatedText).toContain('Accepted');
    
    console.log('✅ SUCCESS: Badge color changed from yellow to green!');
    
    // Check browser console for our debug messages
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Log some key console messages
    console.log('\n📋 Browser Console Messages:');
    const relevantMessages = consoleMessages.filter(msg => 
      msg.includes('STATUS CHANGE') || 
      msg.includes('BUTTON CLICKED') || 
      msg.includes('Saving patient') ||
      msg.includes('Rendering')
    );
    relevantMessages.forEach(msg => console.log(`   ${msg}`));
  });
  
  test('should persist status change after page refresh', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174');
    
    // Wait for app to load
    await page.waitForSelector('#patientSelect', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ App loaded');
    
    // Select pt_501
    await page.selectOption('#patientSelect', 'pt_501');
    await page.waitForTimeout(1000);
    
    // Find an "Accepted" bed search (from previous test)
    const acceptedRows = await page.locator('.search-row .status-badge.badge-accepted').all();
    
    if (acceptedRows.length > 0) {
      const acceptedRow = await page.locator('.search-row:has(.badge-accepted)').first();
      const facilityName = await acceptedRow.locator('.search-facility').textContent();
      
      console.log(`✅ Found "Accepted" bed search before refresh: ${facilityName}`);
      
      // Refresh the page
      await page.reload();
      await page.waitForSelector('#patientSelect', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Select pt_501 again
      await page.selectOption('#patientSelect', 'pt_501');
      await page.waitForTimeout(1000);
      
      console.log('🔄 Page refreshed, checking if status persisted...');
      
      // Check if the same facility still has "Accepted" status
      const persistedRow = await page.locator(`.search-row:has-text("${facilityName}")`).first();
      const persistedBadge = await persistedRow.locator('.status-badge').first();
      const persistedClass = await persistedBadge.getAttribute('class');
      const persistedText = await persistedBadge.textContent();
      
      console.log(`🎨 After refresh - badge class: ${persistedClass}`);
      console.log(`🎨 After refresh - badge text: ${persistedText}`);
      
      // Verify status persisted
      expect(persistedClass).toContain('badge-accepted');
      expect(persistedText).toContain('Accepted');
      
      console.log('✅ SUCCESS: Status persisted after refresh!');
    } else {
      console.log('⚠️ No "Accepted" bed searches found - run first test first');
    }
  });
});
