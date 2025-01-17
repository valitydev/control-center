const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.js');
const getEslintConfigs = require('../../tools/utils/get-eslint-configs');

module.exports = [
    ...baseConfig,
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': [
                'error',
                {
                    ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
                    ignoredDependencies: [
                        '@types/lodash-es',
                        '@s-libs/js-core',
                        '@s-libs/micro-dash',
                        '@s-libs/rxjs-core',
                        'dinero.js',
                    ],
                },
            ],
        },
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
    ...(getEslintConfigs()?.appEslintConfig?.() ?? []),
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/prefer-standalone': 'off',
        },
    },
];
