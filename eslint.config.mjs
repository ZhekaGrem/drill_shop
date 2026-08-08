import next from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
// eslint.config.mjs
import prettierConfig from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,mts,tsx,mtsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/no-unknown-property': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
];

export default eslintConfig;
