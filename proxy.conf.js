const THRIFT_PROXY_CONFIG = {
    context: ['/v1', '/stat', '/fistful', '/papi', '/file_storage', '/deanonimus'],
    target: '',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
};

if (!THRIFT_PROXY_CONFIG.target) throw new Error('proxy.conf.js - set the thrift proxy target!');

module.exports = [THRIFT_PROXY_CONFIG];
