import * as importPlugin from 'eslint-plugin-import';
import * as unusedImportsPlugin from 'eslint-plugin-unused-imports';

function getImportOrderConfig(internalPatterns: string[] = []) {
    return {
        files: ['**/*.ts'],
        plugins: {
            import: importPlugin,
        },
        rules: {
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
        },
    };
}

export const baseEslintConfig = [
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
            'sort-imports': ['error', { ignoreMemberSort: false }],
        },
    },
    getImportOrderConfig(),
];

export const appEslintConfig = (options: { internalPatterns?: string[] } = {}) => [
    {
        files: ['**/*.html'],
        rules: {
            '@angular-eslint/template/no-negated-async': 'off',
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off',
        },
    },
    getImportOrderConfig(options?.internalPatterns),
];
