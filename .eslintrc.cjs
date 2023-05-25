/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: '18',
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // Additional typescript-eslint settings.
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-redeclare': ['error'],
    '@typescript-eslint/no-shadow': [
      'error',
      {
        hoist: 'all',
      },
    ],
    '@typescript-eslint/ban-ts-comment': ['warn', { minimumDescriptionLength: 10 }],
    '@typescript-eslint/no-parameter-properties': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreIIFE: true,
      },
    ],
    '@typescript-eslint/promise-function-async': [
      'error',
      {
        checkArrowFunctions: false,
        checkFunctionDeclarations: true,
        checkFunctionExpressions: true,
        checkMethodDeclarations: true,
      },
    ],

    'arrow-body-style': 'warn',
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'always-multiline'],
    'constructor-super': 'error',
    curly: 'error',
    'eol-last': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'new-parens': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-cond-assign': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'no-declare': 'off',
    'no-empty': 'error',
    'no-eval': 'error',
    'no-fallthrough': 'off',
    'no-invalid-this': 'off',
    'no-multiple-empty-lines': 'error',
    'no-new-wrappers': 'error',
    'no-shadow': 'off',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
    'no-unsafe-finally': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'one-var': ['error', 'never'],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'quote-props': ['error', 'as-needed'],
    radix: 'error',
    'space-before-function-paren': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
    'use-isnan': 'error',
    'valid-typeof': 'off',
    'no-return-await': 'warn',

    // Additional React rules
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
      },
    ],
    'react/jsx-curly-brace-presence': 'error',
    'react/self-closing-comp': 'error',
  },
};
