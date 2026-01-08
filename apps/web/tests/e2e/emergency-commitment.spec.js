/**
 * 🎭 Pennsylvania 302 Emergency Commitment Workflow - E2E Test
 * End-to-end testing for emergency mental health commitment process
 */

import { test, expect } from '@playwright/test';

test.describe('🚨 PA 302 Emergency Commitment Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    
    // Wait for application to load
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();
  });

  test('should complete emergency commitment search and placement', async ({ page }) => {
    // Step 1: Start emergency commitment search
    await page.click('[data-testid="start-search"]');
    await page.selectOption('[data-testid="commitment-type"]', '302');
    
    // Verify 302 commitment type is selected
    await expect(page.locator('[data-testid="commitment-type"]')).toHaveValue('302');
    
    // Step 2: Enter patient information
    await page.fill('[data-testid="patient-first-name"]', 'Jane');
    await page.fill('[data-testid="patient-last-name"]', 'Emergency');
    await page.fill('[data-testid="patient-dob"]', '1985-06-15');
    
    // Step 3: Select mental health program (SUD should be excluded for 302)
    await expect(page.locator('[data-testid="program-type-sud"]')).not.toBeVisible();
    await page.click('[data-testid="program-type-mental-health"]');
    
    // Step 4: Search for available facilities
    await page.click('[data-testid="search-facilities"]');
    
    // Wait for search results
    await expect(page.locator('[data-testid="facility-results"]')).toBeVisible();
    
    // Verify only 302-capable facilities are shown
    const facilityCards = page.locator('[data-testid^="facility-card-"]');
    const count = await facilityCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check that all results accept 302 commitments
    for (let i = 0; i < count; i++) {
      const facility = facilityCards.nth(i);
      await expect(facility.locator('[data-testid="accepts-302"]')).toBeVisible();
    }
    
    // Step 5: Select a facility with available beds
    await page.click('[data-testid="facility-card-0"] [data-testid="select-facility"]');
    
    // Verify facility selection
    await expect(page.locator('[data-testid="selected-facility"]')).toBeVisible();
    
    // Step 6: Complete assessment
    await page.click('[data-testid="start-assessment"]');
    
    // Fill emergency assessment
    await page.check('[data-testid="imminent-danger"]');
    await page.check('[data-testid="unable-to-care"]');
    await page.fill('[data-testid="assessment-notes"]', 'Emergency commitment required due to imminent danger to self.');
    
    // Step 7: Submit placement request
    await page.click('[data-testid="submit-placement"]');
    
    // Verify success and placement confirmation
    await expect(page.locator('[data-testid="placement-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="placement-id"]')).toContainText(/PL-\d+/);
    
    // Step 8: Verify audit trail
    await page.click('[data-testid="view-audit-trail"]');
    await expect(page.locator('[data-testid="audit-entry-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-entry-assessment"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-entry-placement"]')).toBeVisible();
  });

  test('should prevent SUD facility selection for 302 commitment', async ({ page }) => {
    // Start search with 302 commitment
    await page.click('[data-testid="start-search"]');
    await page.selectOption('[data-testid="commitment-type"]', '302');
    
    // Fill basic patient info
    await page.fill('[data-testid="patient-first-name"]', 'Test');
    await page.fill('[data-testid="patient-last-name"]', 'Patient');
    
    // Search facilities
    await page.click('[data-testid="search-facilities"]');
    
    // Verify SUD facilities are not in results
    const sudFacilities = page.locator('[data-testid^="facility-card-"][data-facility-type="substance-use"]');
    await expect(sudFacilities).toHaveCount(0);
    
    // Verify only mental health and dual diagnosis facilities appear
    const validFacilities = page.locator('[data-testid^="facility-card-"]');
    const count = await validFacilities.count();
    
    for (let i = 0; i < count; i++) {
      const facility = validFacilities.nth(i);
      const facilityType = await facility.getAttribute('data-facility-type');
      expect(['mental-health', 'dual-diagnosis']).toContain(facilityType);
    }
  });

  test('should handle capacity constraints during emergency placement', async ({ page }) => {
    // Mock a scenario with limited capacity
    await page.route('**/api/facilities*', async route => {
      const facilities = [
        {
          id: 'mh-1',
          name: 'Mental Health Center A',
          type: 'mental-health',
          acceptsCommitmentTypes: ['201', '302', '303'],
          availableBeds: 0 // No capacity
        },
        {
          id: 'mh-2', 
          name: 'Mental Health Center B',
          type: 'mental-health',
          acceptsCommitmentTypes: ['201', '302', '303'],
          availableBeds: 2 // Limited capacity
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(facilities)
      });
    });
    
    // Start emergency search
    await page.click('[data-testid="start-search"]');
    await page.selectOption('[data-testid="commitment-type"]', '302');
    await page.click('[data-testid="program-type-mental-health"]');
    await page.click('[data-testid="search-facilities"]');
    
    // Verify capacity warnings are shown
    await expect(page.locator('[data-testid="capacity-warning"]')).toBeVisible();
    
    // Only facilities with capacity should have selectable options
    const facilityWithCapacity = page.locator('[data-testid="facility-card-mh-2"]');
    const facilityWithoutCapacity = page.locator('[data-testid="facility-card-mh-1"]');
    
    await expect(facilityWithCapacity.locator('[data-testid="select-facility"]')).toBeEnabled();
    await expect(facilityWithoutCapacity.locator('[data-testid="select-facility"]')).toBeDisabled();
  });

  test('should validate commitment type prerequisites', async ({ page }) => {
    // Start search without selecting commitment type
    await page.click('[data-testid="start-search"]');
    
    // Try to search without commitment type
    await page.click('[data-testid="search-facilities"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="commitment-type-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="commitment-type-error"]')).toContainText('Commitment type is required for PA facilities');
    
    // Select valid commitment type
    await page.selectOption('[data-testid="commitment-type"]', '302');
    
    // Error should disappear
    await expect(page.locator('[data-testid="commitment-type-error"]')).not.toBeVisible();
  });

  test('should handle dual diagnosis facility rules for 302', async ({ page }) => {
    // Mock dual diagnosis facility
    await page.route('**/api/facilities*', async route => {
      const facilities = [
        {
          id: 'dual-1',
          name: 'Dual Diagnosis Center',
          type: 'dual-diagnosis',
          primaryFocus: 'mental-health',
          acceptsCommitmentTypes: ['201', '302', '303'],
          availableBeds: 5
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(facilities)
      });
    });
    
    // Start 302 search
    await page.click('[data-testid="start-search"]');
    await page.selectOption('[data-testid="commitment-type"]', '302');
    await page.click('[data-testid="search-facilities"]');
    
    // Dual diagnosis facility should appear
    const dualFacility = page.locator('[data-testid="facility-card-dual-1"]');
    await expect(dualFacility).toBeVisible();
    
    // Should indicate mental health primary focus
    await expect(dualFacility.locator('[data-testid="primary-focus"]')).toContainText('Mental Health Primary');
    
    // Should be selectable for 302 commitment
    await expect(dualFacility.locator('[data-testid="select-facility"]')).toBeEnabled();
  });
});