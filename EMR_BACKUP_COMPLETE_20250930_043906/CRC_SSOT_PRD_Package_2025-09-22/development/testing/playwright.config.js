import { defineConfig, devices } from '@playwright/test';

const remoteDebugPort = process.env.PLAYWRIGHT_REMOTE_DEBUG_PORT || '9222';
const enableRemoteDebug = (() => {
  const flag = process.env.PLAYWRIGHT_REMOTE_DEBUG;
  if (!flag) return Boolean(process.env.PLAYWRIGHT_REMOTE_DEBUG_PORT);
  return ['1', 'true', 'yes'].includes(flag.toLowerCase());
})();

const chromiumLaunchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
if (enableRemoteDebug) {
  chromiumLaunchArgs.unshift(`--remote-debugging-port=${remoteDebugPort}`);
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/results.xml' }],
    ['line']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: chromiumLaunchArgs,
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    ...(process.env.PLAYWRIGHT_INCLUDE_EDGE === '1'
      ? [{
          name: 'microsoft-edge',
          use: { ...devices['Desktop Edge'], channel: 'msedge' },
        }]
      : []),
    {
      name: 'google-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    /* Healthcare-specific browser configurations */
    {
      name: 'epic-emr-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: {
          'X-Healthcare-Context': 'EMR-Testing'
        }
      },
    },

    /* HIPAA Compliance Testing */
    {
      name: 'hipaa-compliance',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
        geolocation: { latitude: 39.9526, longitude: -75.1652 }, // Philadelphia
        locale: 'en-US',
        timezoneId: 'America/New_York'
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'cd ../prototypes/ui_prototype && npx vite dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },

  /* Global test timeout */
  timeout: 30000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 10000
  },

  /* Output folders */
  outputDir: 'test-results/',
  
  /* Global setup and teardown */
  // globalSetup: './global-setup.js',
  // globalTeardown: './global-teardown.js',
});
