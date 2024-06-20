module.exports = {
    extends: '@vality/eslint-config-ng',
    overrides: [
        ...require('@vality/eslint-config-ng/configs').angular('cc').overrides,
        ...require('@vality/eslint-config-ng/configs').importOrder(['@cc/**']).overrides,
    ],
};
