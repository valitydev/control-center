module.exports = (function getConfigs() {
    try {
        return require('../../dist/libs/ng-configs/src');
    } catch (e) {
        console.warn('Vality ESLint config not init!');
        return {};
    }
})();
