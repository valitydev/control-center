const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.js');
const configs = require('../../tools/utils/configs');

module.exports = [
    ...baseConfig,
    {
        files: ['**/*.json'],
        rules: {},
        languageOptions: {
            parser: require('jsonc-eslint-parser'),
        },
    },
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'v',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'v',
                    style: 'kebab-case',
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        // Override or add rules here
        rules: {},
    },
    ...(configs?.appEslintConfig?.() ?? []),
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/prefer-standalone': 'off',
        },
    },
];
