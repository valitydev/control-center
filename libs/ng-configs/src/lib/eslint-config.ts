import * as unusedImports from 'eslint-plugin-unused-imports';

export const baseEslintConfig = [
    {
        files: ['*.ts'],
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
];

export const appEslintConfig = (options: { internalPatterns?: string[] } = {}) => [
    {
        files: ['*.ts'],
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
                    pathGroups: (options.internalPatterns ?? []).map((pattern) => ({
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
    },
];
