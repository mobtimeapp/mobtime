module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': ['off'],
    'import/no-absolute-path': ['off'],
    'import/extensions': ['off'],
    'no-restricted-syntax': ['off'],
    'no-continue': ['off'],
    'quote-props': ['warn', 'consistent-as-needed'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'always-multiline'],
  },
};
