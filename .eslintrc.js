const { join } = require('path')

const baseRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
  'sort-imports': ['error', { ignoreDeclarationSort: true }],
}

module.exports = {
  extends: [
    'react-app',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  rules: {
    ...baseRules,
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: [
        'react-app',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier',
        'prettier/@typescript-eslint',
      ],
      parserOptions: {
        project: [join(__dirname, 'tsconfig.json')],
      },
      rules: {
        ...baseRules,

        'no-return-await': 'off',

        // https://npm.im/eslint-plugin-import
        'import/order': ['error', { alphabetize: { order: 'asc' } }],

        // https://npm.im/@typescript-eslint/eslint-plugin
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': false,
            'ts-ignore': 'allow-with-description',
            'ts-nocheck': true,
            'ts-check': true,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
}
