/* eslint-disable no-undef */
// eslint-disable-next-line jsdoc/no-restricted-syntax
/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prefer-arrow',
    'simple-import-sort',
    'jest-dom',
    'testing-library',
    'eslint-plugin-import',
    'jsdoc',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
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

    // Some rule where we'd like to be more strict that typescript-eslint.
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-redeclare': ['error'],
    'no-shadow': 'off',
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

    // Some rules where we'd like to be less strict.
    // It would be nice to turn these on, but there are too many `any` types in @types files.
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    // Built-in eslint rules where we'd like to be more strict.
    'arrow-body-style': 'warn',
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'always-multiline'],
    curly: 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'new-parens': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-eval': 'error',
    'no-multiple-empty-lines': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
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
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
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
    'testing-library/prefer-user-event': 'error',
    'testing-library/no-render-in-setup': 'error',
    'testing-library/no-wait-for-empty-callback': 'error',
    'testing-library/prefer-explicit-assert': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-screen-queries': 'error',
    'testing-library/prefer-wait-for': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'off',
    'jsdoc/tag-lines': [
      'error',
      'any',
      {
        startLines: 1,
      },
    ],
    'jsdoc/multiline-blocks': [
      'error',
      {
        noZeroLineText: true,
        noMultilineBlocks: true,
        minimumLengthForMultiline: 80,
      },
    ],
    'jsdoc/no-restricted-syntax': [
      'error',
      {
        contexts: [
          {
            // See https://github.com/estree/estree/blob/master/es5.md
            context:
              'ReturnStatement,IfStatement,ForStatement,WhileStatement,SwitchStatement,' +
              'VariableDeclaration[kind="let"],TryStatement,CatchClause,BreakStatement,' +
              'ContinueStatement,SwitchCase,ForInStatement,DoWhileStatement,ArrayExpression,' +
              'UpdateExpression,UnaryExpression,MemberExpression,CallExpression,NewExpression,' +
              'ForOfStatement',
            message: 'Use an implementation comment (//) instead of a JSDoc comment (/** ... */).',
          },
        ],
      },
    ],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        allowStandaloneDeclarations: true,
      },
    ],
  },
};
