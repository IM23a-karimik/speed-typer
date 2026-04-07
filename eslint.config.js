export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        document: 'readonly',
        console: 'readonly',
        Math: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      quotes: ['error', 'single'],
    },
  },
];
