import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
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
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommended,
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
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['src/utils/logger.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'models', pattern: 'src/models/**' },
        { type: 'api', pattern: 'src/api/**' },
        { type: 'stores', pattern: 'src/stores/**' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'routes', pattern: 'src/routes/**' },
        { type: 'components', pattern: 'src/components/**' },
        { type: 'hooks', pattern: 'src/hooks/**' },
        { type: 'utils', pattern: 'src/utils/**' },
        { type: 'i18n', pattern: 'src/i18n/**' },
        { type: 'app', pattern: 'src/{App,main}.{js,jsx,ts,tsx}', mode: 'file' },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: { type: 'app' }, allow: { to: { type: ['app', 'api', 'stores', 'features', 'routes', 'components', 'hooks', 'utils', 'i18n', 'models'] } } },
          { from: { type: 'routes' }, allow: { to: { type: ['api', 'stores', 'features', 'routes', 'components', 'hooks', 'utils', 'i18n', 'models'] } } },
          { from: { type: 'features' }, allow: { to: { type: ['api', 'stores', 'features', 'components', 'hooks', 'utils', 'i18n', 'models'] } } },
          { from: { type: 'api' }, allow: { to: { type: ['api', 'stores', 'utils', 'models'] } } },
          { from: { type: 'stores' }, allow: { to: { type: ['stores', 'utils', 'models'] } } },
          { from: { type: 'components' }, allow: { to: { type: ['components', 'hooks', 'utils', 'i18n', 'models'] } } },
          { from: { type: 'hooks' }, allow: { to: { type: ['hooks', 'api', 'stores', 'utils', 'i18n', 'models'] } } },
          { from: { type: 'models' }, allow: { to: { type: ['models'] } } },
          { from: { type: 'utils' }, allow: { to: { type: ['utils'] } } },
          { from: { type: 'i18n' }, allow: { to: { type: ['utils', 'i18n'] } } },
        ],
      }],
    },
  },
])
