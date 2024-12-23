module.exports = {
    $schema: 'http://json.schemastore.org/prettierrc',
    printWidth: 100,
    singleQuote: true,
    tabWidth: 4,
    plugins: ['prettier-plugin-organize-attributes'],
    attributeSort: 'ASC',
    attributeGroups: [
        '$ANGULAR_ELEMENT_REF',
        '$ANGULAR_STRUCTURAL_DIRECTIVE',
        '$ANGULAR_ANIMATION',
        '$ANGULAR_ANIMATION_INPUT',
        '$ANGULAR_TWO_WAY_BINDING',
        '$ANGULAR_INPUT',
        '$DEFAULT',
        '$ANGULAR_OUTPUT',
    ],
    overrides: [
        {
            files: ['.{vscode,github}/**'],
            options: {
                tabWidth: 2,
            },
        },
        {
            files: '*.svg',
            options: { parser: 'html' },
        },
    ],
    endOfLine: 'auto',
};
