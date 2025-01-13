const nx = require('@nx/eslint-plugin');
const getEslintConfigs = require('./tools/utils/get-eslint-configs');

module.exports = [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: ['**/dist'],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        // Override or add rules here
        rules: {},
    },
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': [
                'error',
                {
                    ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
                },
            ],
        },
        languageOptions: {
            parser: require('jsonc-eslint-parser'),
        },
    },
    ...(getEslintConfigs()?.baseEslintConfig ?? []),
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': [
                'error',
                { ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'] },
            ],
        },
        languageOptions: { parser: require('jsonc-eslint-parser') },
    },
];
