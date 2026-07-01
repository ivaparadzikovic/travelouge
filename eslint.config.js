import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['src/utils/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'api', pattern: 'src/api/**' },
        { type: 'stores', pattern: 'src/stores/**' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'routes', pattern: 'src/routes/**' },
        { type: 'components', pattern: 'src/components/**' },
        { type: 'utils', pattern: 'src/utils/**' },
        { type: 'i18n', pattern: 'src/i18n/**' },
        { type: 'app', pattern: 'src/{App,main}.{js,jsx}', mode: 'file' },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: { type: 'app' }, allow: { to: { type: ['app', 'api', 'stores', 'features', 'routes', 'components', 'utils', 'i18n'] } } },
          { from: { type: 'routes' }, allow: { to: { type: ['api', 'stores', 'features', 'routes', 'components', 'utils', 'i18n'] } } },
          { from: { type: 'features' }, allow: { to: { type: ['api', 'stores', 'features', 'components', 'utils', 'i18n'] } } },
          { from: { type: 'api' }, allow: { to: { type: ['api', 'stores', 'utils'] } } },
          { from: { type: 'stores' }, allow: { to: { type: ['stores', 'utils'] } } },
          { from: { type: 'components' }, allow: { to: { type: ['components', 'utils', 'i18n'] } } },
          { from: { type: 'utils' }, allow: { to: { type: ['utils'] } } },
          { from: { type: 'i18n' }, allow: { to: { type: ['utils', 'i18n'] } } },
        ],
      }],
    },
  },
])
