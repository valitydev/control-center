module.exports = {
    extends: '@vality/eslint-config',
    overrides: [
        ...require('@vality/eslint-config/configs').angular('cc').overrides,
        ...require('@vality/eslint-config/configs').importOrder(['@cc/**']).overrides,
    ],
};
