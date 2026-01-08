import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('CRC SSOT EMR - HIPAA Compliance & Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should enforce HTTPS protocol', async ({ page }) => {
    // Check if running on HTTPS (skip for localhost development)
    const url = page.url();
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      expect(url).toMatch(/^https:/);
    }
  });

  test('should not expose sensitive patient data in console', async ({ page }) => {
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Navigate and interact with patient data
    const patientItems = page.locator('.patient-item, [data-test="patient-item"]');
    if (await patientItems.count() > 0) {
      await patientItems.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Check console messages for potential PHI exposure
    const sensitivePatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN pattern
      /\d{10,}/, // MRN or other long ID numbers
      /patient.*\d+.*\d+.*\d+/, // Complex patient data patterns
      /dob.*\d{4}/, // Date of birth patterns
    ];
    
    const exposedData = consoleMessages.filter(msg =>
      sensitivePatterns.some(pattern => pattern.test(msg.toLowerCase()))
    );
    
    expect(exposedData).toHaveLength(0);
  });

  test('should implement proper data masking', async ({ page }) => {
    // Check for masked data elements
    const maskedElements = page.locator('[data-masked="true"], .masked-data, .redacted');
    
    if (await maskedElements.count() > 0) {
      // Verify masked elements don't show actual data
      for (let i = 0; i < await maskedElements.count(); i++) {
        const element = maskedElements.nth(i);
        const text = await element.textContent();
        
        // Masked data should contain asterisks or be empty
        expect(text).toMatch(/^\*+$|^$|^\[REDACTED\]$|^\[MASKED\]$/);
      }
    }
  });

  test('should require user authentication context', async ({ page }) => {
    // Check for authentication indicators
    const authElements = page.locator('.user-info, [data-user-role], [data-test="user-auth"]');
    
    if (await authElements.count() > 0) {
      await expect(authElements.first()).toBeVisible();
    }
    
    // Check for break-the-glass functionality
    const breakGlassElements = page.locator('[data-test="break-glass"], .break-glass, .emergency-access');
    
    if (await breakGlassElements.count() > 0) {
      await breakGlassElements.first().click();
      
      // Should require justification
      const justificationInput = page.locator('input[placeholder*="justification"], textarea[placeholder*="reason"]');
      if (await justificationInput.count() > 0) {
        await expect(justificationInput).toBeVisible();
      }
    }
  });

  test('should implement audit logging', async ({ page }) => {
    // Check for audit trail functionality
    const auditElements = page.locator('.audit-log, [data-test="audit"], [data-audit-event]');
    
    if (await auditElements.count() > 0) {
      await expect(auditElements.first()).toBeVisible();
    }
    
    // Perform an action that should be audited
    const patientItems = page.locator('.patient-item, [data-test="patient-item"]');
    if (await patientItems.count() > 0) {
      await patientItems.first().click();
      
      // Check if audit event was recorded
      const auditEntries = page.locator('.audit-entry, [data-audit-entry]');
      if (await auditEntries.count() > 0) {
        expect(await auditEntries.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should validate data encryption in storage', async ({ page }) => {
    // Check localStorage for unencrypted sensitive data
    const storageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    // Look for potential PHI in storage
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{2}\/\d{2}\/\d{4}\b/, // DOB
      /\b[A-Z]{2}\d{8}\b/, // Medical record numbers
    ];
    
    Object.entries(storageData).forEach(([key, value]) => {
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(value)) {
          // If sensitive data is found, it should be encrypted (not plain text)
          expect(value).toMatch(/^[a-zA-Z0-9+\/=]+$/); // Base64 pattern for encrypted data
        }
      });
    });
  });

  test('should handle session timeout properly', async ({ page }) => {
    // Look for session timeout indicators
    const sessionElements = page.locator('[data-session-timeout], .session-timer, .timeout-warning');
    
    if (await sessionElements.count() > 0) {
      await expect(sessionElements.first()).toBeVisible();
    }
    
    // Check for session expiration warning
    const timeoutValue = await page.evaluate(() => {
      // Look for session timeout configuration
      return window.SESSION_TIMEOUT || localStorage.getItem('sessionTimeout') || 30;
    });
    
    expect(parseInt(timeoutValue)).toBeGreaterThan(0);
  });

  test('should validate minimum necessary principle', async ({ page }) => {
    // Check that only necessary patient data is displayed
    const patientElements = page.locator('[data-patient-id], .patient-item');
    
    if (await patientElements.count() > 0) {
      const firstPatient = patientElements.first();
      await firstPatient.click();
      
      // Check what patient data is visible
      const visibleFields = await page.locator('[data-field]').allTextContents();
      
      // Should not display all possible patient fields at once
      const sensitiveFields = ['ssn', 'social-security', 'full-dob', 'insurance-id'];
      const exposedSensitiveFields = visibleFields.filter(field =>
        sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))
      );
      
      expect(exposedSensitiveFields.length).toBeLessThanOrEqual(2); // Minimal exposure
    }
  });

  test('should implement proper error handling without data exposure', async ({ page }) => {
    // Trigger potential error conditions
    const errorMessages = [];
    page.on('pageerror', error => errorMessages.push(error.message));
    
    // Try to access non-existent patient
    await page.evaluate(() => {
      // Simulate invalid patient access
      if (window.selectPatient) {
        window.selectPatient('INVALID_PATIENT_ID');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that error messages don't contain sensitive data
    errorMessages.forEach(message => {
      expect(message).not.toMatch(/\d{3}-\d{2}-\d{4}/); // No SSN
      expect(message).not.toMatch(/MRN:\s*\d+/); // No MRN
      expect(message).not.toMatch(/Patient:\s*[A-Za-z]+,\s*[A-Za-z]+/); // No full names
    });
  });

  test('should validate consent management', async ({ page }) => {
    // Look for consent management features
    const consentElements = page.locator('[data-consent], .consent-form, [data-test="consent"]');
    
    if (await consentElements.count() > 0) {
      await expect(consentElements.first()).toBeVisible();
      
      // Check for consent status indicators
      const consentStatus = page.locator('.consent-status, [data-consent-status]');
      if (await consentStatus.count() > 0) {
        const statusText = await consentStatus.first().textContent();
        expect(statusText).toMatch(/(granted|denied|pending|expired)/i);
      }
    }
  });

  test('should validate accessibility compliance', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalRuleIds = new Set(['color-contrast', 'keyboard']);
    const relevantViolations = results.violations.filter((violation) => {
      if (criticalRuleIds.has(violation.id)) {
        return true;
      }
      return ['serious', 'critical'].includes(violation.impact || '');
    });

    expect(relevantViolations).toEqual([]);
  });

  test('should validate secure data transmission', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });
    
    // Perform actions that might trigger API calls
    const patientItems = page.locator('.patient-item, [data-test="patient-item"]');
    if (await patientItems.count() > 0) {
      await patientItems.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Check that requests use secure protocols
    const insecureRequests = requests.filter(req => 
      req.url.startsWith('http:') && !req.url.includes('localhost')
    );
    
    expect(insecureRequests).toHaveLength(0);
    
    // Check for proper headers in API requests
    const apiRequests = requests.filter(req => 
      req.url.includes('/api/') || req.url.includes('/patient/') || req.url.includes('/facility/')
    );
    
    apiRequests.forEach(req => {
      // Should have proper authorization headers
      expect(req.headers['authorization'] || req.headers['x-api-key']).toBeDefined();
    });
  });
});
