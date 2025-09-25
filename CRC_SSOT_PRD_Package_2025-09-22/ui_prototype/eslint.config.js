import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly'
      }
    },
    plugins: {
      import: pluginImport
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'import/order': [
        'warn',
        {
          'alphabetize': { order: 'asc', caseInsensitive: true },
          'groups': [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always'
        }
      ]
    }
  }
];
