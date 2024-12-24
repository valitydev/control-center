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
                        'prettier-plugin-organize-attributes',
                        'cspell',
                        '@cspell/dict-ru_ru',
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
