// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const importPlugin = require('eslint-plugin-import');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const pathsPlugin = require('eslint-plugin-paths');

function getImportOrderConfig(internalPatterns = ['~/**']) {
    return {
        files: ['**/*.ts'],
        plugins: {
            import: importPlugin,
            paths: pathsPlugin,
        },
        rules: {
            'sort-imports': [
                'error',
                {
                    ignoreDeclarationSort: true,
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        ['builtin', 'external'],
                        'type',
                        'internal',
                        'parent',
                        ['index', 'sibling'],
                        'object',
                    ],
                    pathGroups: internalPatterns.map((pattern) => ({
                        pattern,
                        group: 'internal',
                    })),
                    pathGroupsExcludedImportTypes: ['builtin'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
            'paths/alias': 'error',
        },
    };
}

const baseEslintConfig = [
    {
        files: ['**/*.ts'],
        plugins: {
            'unused-imports': unusedImportsPlugin,
        },
        rules: {
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-unused-vars': 'off', // for unused-imports
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_|^[A-Z]$',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            'no-duplicate-imports': 'error',
        },
    },
    getImportOrderConfig(),
];

module.exports = tseslint.config(
    {
        files: ['**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
            ...angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'cc',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'cc',
                    style: 'kebab-case',
                },
            ],
            // Temporarily disabled due to issues with standalone components
            '@angular-eslint/prefer-standalone': 'warn',
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
        rules: {
            '@angular-eslint/template/no-negated-async': 'off',
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off',
        },
    },
    ...baseEslintConfig,
);
