import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'happy-dom', // Lightweight DOM for unit tests
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx}',
      'tests/unit/**/*.{test,spec}.{js,jsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e'
    ],
    
    // Global configuration
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/config/vitest-setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      
      // Coverage thresholds (healthcare-grade quality)
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },
      
      // Include/exclude patterns
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'node_modules',
        'dist'
      ]
    },
    
    // Test timeout (healthcare operations may be complex)
    testTimeout: 10000,
    
    // Retry configuration
    retry: process.env.CI ? 2 : 0,
    
    // Reporter configuration  
    reporter: [
      'default',
      'json',
      'html'
    ],
    
    // Output directory
    outputFile: {
      json: './test-results/unit-results.json',
      html: './test-results/unit-results.html'
    },
    
    // Mock configuration for healthcare APIs
    clearMocks: true,
    restoreMocks: true,
    
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_TEST_MODE: 'true',
      VITE_API_URL: 'http://localhost:3001/api',
      VITE_HIPAA_COMPLIANCE: 'test-mode',
      VITE_AUDIT_LOGGING: 'disabled'
    }
  },
  
  // Define configuration for different test types
  define: {
    'import.meta.env.VITE_TEST_MODE': '"true"',
    'import.meta.env.VITE_API_URL': '"http://localhost:3001/api"'
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@tests': new URL('./tests', import.meta.url).pathname
    }
  }
});