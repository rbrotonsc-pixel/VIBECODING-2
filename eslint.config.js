import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'dist/'] },
  js.configs.recommended,
  { files: ['src/web/**/*.js'], languageOptions: { globals: globals.browser } },
  {
    files: ['src/server/**/*.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
];
