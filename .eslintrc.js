export default {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['import'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': ['off'],
    'import/no-absolute-path': ['off'],
    'import/extensions': ['off'],
    'no-restricted-syntax': ['off'],
    'no-continue': ['off'],
    'quote-props': ['warn', 'consistent-as-needed'],
  },
};
