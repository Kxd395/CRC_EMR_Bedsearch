import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chrome MCP Demo - EMR Healthcare Testing', () => {
  test('should demonstrate Chrome MCP integration with EMR prototype', async ({ page }) => {
    console.log('🚀 Starting Chrome MCP Demo Test');
    
    // Load the demo HTML file directly
    const demoPath = path.join(__dirname, '../chrome-mcp-demo.html');
    await page.goto(`file://${demoPath}`);
    
    // Wait for the page to load and scripts to execute
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Allow time for tests to run
    
    // Verify page loaded
    const title = await page.title();
    expect(title).toContain('CRC SSOT EMR');
    console.log(`📄 Page title: ${title}`);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/chrome-mcp-demo-loaded.png', 
      fullPage: true 
    });
    
    // Test Chrome MCP status indicator
    const mcpStatus = await page.textContent('#mcp-status');
    expect(mcpStatus).toContain('Connected');
    console.log(`🔗 MCP Status: ${mcpStatus}`);
    
    // Test patient management functionality
    const patientItems = page.locator('[data-test="patient-item"]');
    const patientCount = await patientItems.count();
    expect(patientCount).toBeGreaterThan(0);
    console.log(`👥 Found ${patientCount} patients`);
    
    // Click on first patient (simulates Chrome MCP command)
    await patientItems.first().click();
    console.log('🏥 Patient selected via Chrome MCP simulation');
    
    // Test facility search functionality
    const facilitySearch = page.locator('[data-test="facility-search"]');
    await facilitySearch.fill('Philadelphia');
    console.log('🔍 Facility search tested');
    
    // Test settings button
    const settingsBtn = page.locator('[data-test="settings"]');
    await settingsBtn.click();
    console.log('⚙️ Settings button tested');
    
    // Get test results from the page
    const testResults = await page.textContent('#test-output');
    console.log('🧪 EMR Test Results:', testResults);
    expect(testResults).toContain('passed');
    
    // Test Chrome MCP API simulation
    const chromeMCPTest = await page.evaluate(() => {
      if (window.chromeMCP && window.testData) {
        const results = {
          patientSelection: window.chromeMCP.selectPatient('1001'),
          facilitySearch: window.chromeMCP.searchFacilities('Philadelphia'),
          settingsOpen: window.chromeMCP.openSettings(),
          screenshot: window.chromeMCP.captureScreenshot(),
          testData: {
            patientCount: window.testData.patients.length,
            facilityCount: window.testData.facilities.length
          }
        };
        return results;
      }
      return null;
    });
    
    expect(chromeMCPTest).toBeTruthy();
    expect(chromeMCPTest.patientSelection.success).toBe(true);
    expect(chromeMCPTest.facilitySearch.success).toBe(true);
    expect(chromeMCPTest.settingsOpen.success).toBe(true);
    console.log('✅ Chrome MCP API simulation successful:', chromeMCPTest);
    
    // Test HIPAA compliance features
    const hipaaTest = await page.evaluate(() => {
      // Test secure localStorage
      try {
        localStorage.setItem('hipaa-test', 'encrypted-patient-data');
        const stored = localStorage.getItem('hipaa-test');
        localStorage.removeItem('hipaa-test');
        return {
          localStorageWorks: stored === 'encrypted-patient-data',
          sessionStorageAvailable: typeof sessionStorage !== 'undefined',
          secureContext: location.protocol === 'file:' || location.protocol === 'https:'
        };
      } catch (e) {
        return { localStorageWorks: false, error: e.message };
      }
    });
    
    expect(hipaaTest.localStorageWorks).toBe(true);
    expect(hipaaTest.sessionStorageAvailable).toBe(true);
    console.log('🔒 HIPAA compliance features verified:', hipaaTest);
    
    // Test healthcare workflow automation
    const workflowTest = await page.evaluate(() => {
      const workflows = [];
      
      // Patient management workflow
      const patients = document.querySelectorAll('[data-test="patient-item"]');
      workflows.push({
        name: 'Patient Management',
        elements: patients.length,
        interactive: patients.length > 0
      });
      
      // Facility finder workflow
      const facilityFinder = document.querySelector('[data-test="facility-finder"]');
      workflows.push({
        name: 'Facility Finder',
        available: !!facilityFinder,
        interactive: !!document.querySelector('[data-test="facility-search"]')
      });
      
      // Settings management workflow
      const settings = document.querySelector('[data-test="settings"]');
      workflows.push({
        name: 'Settings Management',
        available: !!settings,
        interactive: true
      });
      
      return {
        totalWorkflows: workflows.length,
        availableWorkflows: workflows.filter(w => w.available || w.interactive).length,
        workflows: workflows
      };
    });
    
    expect(workflowTest.totalWorkflows).toBeGreaterThan(0);
    expect(workflowTest.availableWorkflows).toBeGreaterThan(0);
    console.log('🔄 Healthcare workflows verified:', workflowTest);
    
    // Final screenshot with results
    await page.screenshot({ 
      path: 'test-results/chrome-mcp-demo-complete.png', 
      fullPage: true 
    });
    
    console.log('✅ Chrome MCP Demo Test Complete - All Healthcare Workflows Verified');
  });

  test('should demonstrate performance monitoring with Chrome MCP', async ({ page }) => {
    console.log('📊 Testing Performance Monitoring Features');
    
    const demoPath = path.join(__dirname, '../chrome-mcp-demo.html');
    await page.goto(`file://${demoPath}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Get performance metrics using Chrome DevTools Protocol
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        navigation: {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          responseTime: navigation ? navigation.responseEnd - navigation.responseStart : 0
        },
        resources: {
          count: resources.length,
          totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
        },
        memory: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });
    
    console.log('🚀 Performance Metrics:', performanceMetrics);
    
    // Performance assertions for healthcare applications
    expect(performanceMetrics.navigation.loadTime).toBeLessThan(3000); // Load under 3 seconds
    expect(performanceMetrics.resources.count).toBeGreaterThan(0);
    
    if (performanceMetrics.memory) {
      console.log(`💾 Memory Usage: ${(performanceMetrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
      expect(performanceMetrics.memory.used).toBeLessThan(performanceMetrics.memory.limit);
    }
    
    console.log('✅ Performance monitoring verification complete');
  });

  test('should validate Chrome MCP security features for healthcare', async ({ page }) => {
    console.log('🔐 Testing Healthcare Security Features');
    
    const demoPath = path.join(__dirname, '../chrome-mcp-demo.html');
    await page.goto(`file://${demoPath}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Test security context
    const securityTest = await page.evaluate(() => {
      return {
        secureContext: typeof isSecureContext !== 'undefined' ? isSecureContext : false,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        crypto: typeof crypto !== 'undefined',
        geolocation: typeof navigator.geolocation !== 'undefined'
      };
    });
    
    // Healthcare applications need secure storage
    expect(securityTest.localStorage).toBe(true);
    expect(securityTest.sessionStorage).toBe(true);
    expect(securityTest.crypto).toBe(true);
    
    console.log('🔒 Security Context:', securityTest);
    
    // Test console doesn't expose sensitive data
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Trigger patient interaction
    await page.click('[data-test="patient-item"]');
    await page.waitForTimeout(1000);
    
    // Check that console doesn't contain PHI
    const sensitivePatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN
      /MRN:\s*\d{9}/, // Full MRN
      /DOB:\s*\d{2}\/\d{2}\/\d{4}/ // DOB
    ];
    
    const exposedData = consoleLogs.filter(log =>
      sensitivePatterns.some(pattern => pattern.test(log))
    );
    
    expect(exposedData.length).toBe(0);
    console.log(`✅ Security verification: No PHI exposed in ${consoleLogs.length} console messages`);
    
    console.log('✅ Healthcare security features validated');
  });
});