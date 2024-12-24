module.exports = function getEslintConfigs() {
    try {
        return require('../../dist/libs/ng-configs');
    } catch (e) {
        console.warn('Vality ESLint config not init!');
        return {};
    }
};
