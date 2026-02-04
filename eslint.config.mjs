import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'node_modules/',
      '**/dist/**',
      '**/*.js',
      '**/*.d.ts',
      'jest.config.cjs',
      '.tmp/',
      'build.js'
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

