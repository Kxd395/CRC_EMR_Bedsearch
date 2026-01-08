import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directories
  testDir: './tests/e2e',
  
  // Global test configuration
  timeout: 60000,
  expect: { timeout: 10000 },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Global setup and teardown
  globalSetup: './tests/config/global-setup.js',
  globalTeardown: './tests/config/global-teardown.js',
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:5174',
    
    // Collect trace when retrying failed tests
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Healthcare compliance settings
    extraHTTPHeaders: {
      'X-Test-Environment': 'playwright',
      'X-HIPAA-Compliance': 'test-mode'
    },
    
    // Ignore HTTPS errors in development
    ignoreHTTPSErrors: true
  },

  // Project configurations for different browsers and scenarios
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      teardown: 'cleanup'
    },
    
    {
      name: 'cleanup', 
      testMatch: /.*\.teardown\.js/
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup']
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup']
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup']
    },

    // Mobile devices (healthcare staff often use tablets)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup']
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup']
    },

    // Healthcare-specific scenarios
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure accessibility testing runs with proper context
        extraHTTPHeaders: {
          'X-Test-Type': 'accessibility',
          'X-WCAG-Level': 'AA'
        }
      },
      dependencies: ['setup'],
      testMatch: /.*\.accessibility\.spec\.js/
    },
    
    {
      name: 'commitment-workflows',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Test-Type': 'commitment-workflow',
          'X-PA-Compliance': 'enabled'
        }
      },
      dependencies: ['setup'],
      testMatch: /.*\.commitment\.spec\.js/
    }
  ],

  // Web server configuration for local development
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Test-specific environment variables
      VITE_TEST_MODE: 'true',
      VITE_API_URL: 'http://localhost:3001/api',
      VITE_HIPAA_COMPLIANCE: 'test-mode',
      VITE_AUDIT_LOGGING: 'enabled'
    }
  },

  // Output directories
  outputDir: 'test-results/',
  
  // Test configuration
  maxFailures: process.env.CI ? 10 : undefined,
  
  // Healthcare compliance metadata
  metadata: {
    'test-suite': 'crc-ssot-emr',
    'compliance': 'hipaa-ready',
    'pa-commitment-rules': 'enabled',
    'accessibility-level': 'wcag-2.1-aa',
    'browser-support': 'modern-browsers',
    'mobile-support': 'ios-android'
  }
});