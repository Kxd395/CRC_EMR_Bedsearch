import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser API globals
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        FormData: 'readonly',
        
        // Dialog APIs
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        
        // Timing APIs
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Crypto APIs
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        
        // Event APIs
        Event: 'readonly',
        CustomEvent: 'readonly',
        EventTarget: 'readonly',
        
        // Environment globals (Vite/build)
        process: 'readonly',
        __APP_VERSION__: 'readonly'
      }
    },
    plugins: {
      import: pluginImport
    },
    rules: {
      // Code quality
      'no-console': 'off', // Allow console in development
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Import rules
      'import/order': [
        'warn',
        {
          'alphabetize': { order: 'asc', caseInsensitive: true },
          'groups': [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always'
        }
      ],
      'import/extensions': ['error', 'ignorePackages'],
      
      // Security rules (basic security patterns)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-debugger': 'error'
    }
  },
  {
    // Test files configuration
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
    languageOptions: {
      globals: {
        // Test framework globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly', // Vitest
        jest: 'readonly', // Jest
        
        // Node.js test globals
        global: 'writable',
        testUtils: 'readonly'
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
];
