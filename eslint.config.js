import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'test',
      'vitest.config.mts',
      'vitest.config.mts',
      'package.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.*.json',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  { languageOptions: { ecmaVersion: 2020, globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'warn',
      'no-debugger': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      // react
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/destructuring-assignment': [
        'error',
        'always',
        { ignoreClassFields: true, destructureInSignature: 'always' },
      ],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          shorthandLast: false,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
    },
  },
  { settings: { react: { version: 'detect' } } },
]
