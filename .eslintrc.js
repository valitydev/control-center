const rules = require('./tools/eslint-config/rules');

const baseTsRules = {
    parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true,
    },
    extends: [
        './tools/eslint-config/typescript',
        './tools/eslint-config/angular',
        './tools/eslint-config/lodash',
        'prettier',
    ],
    rules: {
        ...rules.createImportOrderRule({ internalPathsPattern: '@cc/**' }),
        // TODO: pretenders for error
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
    },
};

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['**/gen-*/**/*'],
    overrides: [
        {
            ...baseTsRules,
            files: ['*.ts'],
            rules: {
                ...baseTsRules.rules,
                ...rules.createAngularSelectorRules({ prefix: 'cc' }),
                // TODO: pretenders for error
                '@typescript-eslint/no-floating-promises': 'warn',
            },
        },
        {
            ...baseTsRules,
            files: ['*.spec.ts'],
            extends: [...baseTsRules.extends, './tools/eslint-config/jasmine'],
        },
        {
            files: ['*.html'],
            extends: ['plugin:@angular-eslint/template/recommended'],
            rules: {
                // TODO: pretenders for error
                '@angular-eslint/template/no-negated-async': 'warn',
            },
        },
    ],
};
