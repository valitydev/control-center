const baseConfig = require('../../eslint.config.js');

module.exports = [
    ...baseConfig,
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': [
                'error',
                {
                    ignoredFiles: [
                        '{projectRoot}/eslint.config.{js,cjs,mjs}',
                        '{projectRoot}/vite.config.{js,ts,mjs,mts}',
                    ],
                    ignoredDependencies: [
                        'prettier',
                        'eslint-plugin-import',
                        'prettier-plugin-organize-attributes',
                    ],
                    checkMissingDependencies: false,
                },
            ],
        },
        languageOptions: {
            parser: require('jsonc-eslint-parser'),
        },
    },
];
