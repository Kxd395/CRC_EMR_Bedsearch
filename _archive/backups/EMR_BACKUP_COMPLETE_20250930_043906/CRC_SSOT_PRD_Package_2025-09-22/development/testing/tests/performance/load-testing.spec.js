import { test, expect } from '@playwright/test';

test.describe('CRC SSOT EMR - Performance & Load Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should load EMR interface within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for all critical elements to load
    await Promise.all([
      page.waitForSelector('.patient-list, [data-test="patient-list"]', { timeout: 5000 }),
      page.waitForSelector('.facility-finder, [data-test="facility-finder"]', { timeout: 5000 }),
      page.waitForSelector('.header, [data-test="header"]', { timeout: 5000 })
    ]);
    
    const loadTime = Date.now() - startTime;
    
    // Healthcare systems should load within 3 seconds for critical workflows
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`EMR interface loaded in ${loadTime}ms`);
  });

  test('should handle multiple patient searches efficiently', async ({ page }) => {
    const searchTerms = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'];
    const searchTimes = [];
    
    for (const term of searchTerms) {
      const searchInput = page.locator('#patient-search, [data-test="patient-search"]').first();
      
      if (await searchInput.count() > 0) {
        const startTime = Date.now();
        
        await searchInput.clear();
        await searchInput.fill(term);
        
        // Wait for search results
        await page.waitForTimeout(500);
        
        const endTime = Date.now();
        const searchTime = endTime - startTime;
        searchTimes.push(searchTime);
        
        console.log(`Search for "${term}" took ${searchTime}ms`);
      }
    }
    
    // Average search time should be under 500ms
    const averageTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
    expect(averageTime).toBeLessThan(500);
  });

  test('should handle facility filtering without performance degradation', async ({ page }) => {
    const facilityFilters = page.locator('.facility-filter, [data-test="facility-filter"]');
    
    if (await facilityFilters.count() > 0) {
      const startTime = Date.now();
      
      // Apply multiple filters rapidly
      for (let i = 0; i < Math.min(5, await facilityFilters.count()); i++) {
        await facilityFilters.nth(i).click();
        await page.waitForTimeout(100);
      }
      
      // Wait for filtering to complete
      await page.waitForTimeout(1000);
      
      const endTime = Date.now();
      const filterTime = endTime - startTime;
      
      // Filtering should complete within 2 seconds
      expect(filterTime).toBeLessThan(2000);
      
      console.log(`Facility filtering completed in ${filterTime}ms`);
    }
  });

  test('should maintain performance with large dataset', async ({ page }) => {
    // Simulate loading large amounts of data
    const largeDataScript = `
      // Simulate large patient dataset
      const largePatientData = Array.from({length: 1000}, (_, i) => ({
        id: i + 1,
        name: \`Patient \${i + 1}\`,
        mrn: \`MRN\${String(i + 1).padStart(6, '0')}\`,
        status: ['Active', 'Inactive', 'Pending'][i % 3],
        asam: ['3.5', '3.7', '4.0'][i % 3],
        loc: ['Residential', 'Outpatient', 'Inpatient'][i % 3]
      }));
      
      // Measure render time
      const startTime = performance.now();
      
      if (window.loadPatientData) {
        window.loadPatientData(largePatientData);
      }
      
      const endTime = performance.now();
      window.renderTime = endTime - startTime;
    `;
    
    await page.evaluate(largeDataScript);
    
    const renderTime = await page.evaluate(() => window.renderTime || 0);
    
    // Large dataset rendering should complete within 1 second
    expect(renderTime).toBeLessThan(1000);
    
    console.log(`Large dataset rendered in ${renderTime}ms`);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory) {
      // Perform memory-intensive operations
      await page.evaluate(() => {
        // Create temporary large objects
        for (let i = 0; i < 100; i++) {
          const tempData = Array(1000).fill().map((_, idx) => ({
            id: idx,
            data: `Large data string ${idx}`.repeat(100)
          }));
          
          // Simulate processing
          tempData.forEach(item => item.processed = true);
        }
        
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const finalMemory = await page.evaluate(() => {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      });
      
      const memoryIncrease = finalMemory.used - initialMemory.used;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100;
      
      // Memory usage shouldn't increase by more than 50%
      expect(memoryIncreasePercent).toBeLessThan(50);
      
      console.log(`Memory usage increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${memoryIncreasePercent.toFixed(1)}%)`);
    }
  });

  test('should handle concurrent user interactions', async ({ page }) => {
    // Simulate multiple rapid interactions
    const interactions = [
      async () => {
        const patientItems = page.locator('.patient-item, [data-test="patient-item"]');
        if (await patientItems.count() > 0) {
          await patientItems.first().click();
        }
      },
      async () => {
        const facilitySearch = page.locator('#facility-search, [data-test="facility-search"]').first();
        if (await facilitySearch.count() > 0) {
          await facilitySearch.fill('Philadelphia');
        }
      },
      async () => {
        const settingsBtn = page.locator('.settings-btn, [data-test="settings"]').first();
        if (await settingsBtn.count() > 0) {
          await settingsBtn.click();
        }
      }
    ];
    
    const startTime = Date.now();
    
    // Execute interactions concurrently
    await Promise.all(interactions.map(interaction => interaction()));
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Concurrent interactions should complete within 2 seconds
    expect(totalTime).toBeLessThan(2000);
    
    console.log(`Concurrent interactions completed in ${totalTime}ms`);
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
    console.log(`Largest Contentful Paint: ${lcp}ms`);
    
    // Measure First Input Delay (FID) simulation
    const startTime = Date.now();
    const patientItems = page.locator('.patient-item, [data-test="patient-item"]');
    
    if (await patientItems.count() > 0) {
      await patientItems.first().click();
    }
    
    const fid = Date.now() - startTime;
    
    // FID should be under 100ms
    expect(fid).toBeLessThan(100);
    console.log(`Simulated First Input Delay: ${fid}ms`);
  });

  test('should handle network latency gracefully', async ({ page }) => {
    // Simulate slow network conditions
    const client = await page.context().newCDPSession(page);
    
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 300, // 300ms latency
      downloadThroughput: 1000000, // 1 Mbps
      uploadThroughput: 500000 // 0.5 Mbps
    });
    
    const startTime = Date.now();
    
    // Perform data-intensive operation
    const facilitySearch = page.locator('#facility-search, [data-test="facility-search"]').first();
    if (await facilitySearch.count() > 0) {
      await facilitySearch.fill('Philadelphia');
      await page.waitForTimeout(1000); // Wait for results
    }
    
    const endTime = Date.now();
    const operationTime = endTime - startTime;
    
    // Should handle slow network within reasonable time (under 5 seconds)
    expect(operationTime).toBeLessThan(5000);
    
    console.log(`Operation completed under slow network in ${operationTime}ms`);
    
    // Restore normal network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
  });

  test('should validate resource loading efficiency', async ({ page }) => {
    // Monitor resource loading
    const resources = [];
    
    page.on('response', response => {
      resources.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        type: response.request().resourceType(),
        timing: response.timing()
      });
    });
    
    // Navigate and wait for resources
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Analyze resource loading
    const imageResources = resources.filter(r => r.type === 'image');
    const scriptResources = resources.filter(r => r.type === 'script');
    const stylesheetResources = resources.filter(r => r.type === 'stylesheet');
    
    // Check for excessive resource sizes
    const largeResources = resources.filter(r => parseInt(r.size) > 1024 * 1024); // > 1MB
    expect(largeResources.length).toBeLessThan(3); // No more than 2 large resources
    
    // Check for failed resources
    const failedResources = resources.filter(r => r.status >= 400);
    expect(failedResources.length).toBe(0);
    
    console.log(`Loaded ${resources.length} resources:`);
    console.log(`- Images: ${imageResources.length}`);
    console.log(`- Scripts: ${scriptResources.length}`);
    console.log(`- Stylesheets: ${stylesheetResources.length}`);
    console.log(`- Large resources (>1MB): ${largeResources.length}`);
    console.log(`- Failed resources: ${failedResources.length}`);
  });
});