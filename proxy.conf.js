require('dotenv').config();

const THRIFT_PROXY_CONFIG = {
    context: [
        '/v1',
        '/v3',
        '/stat',
        '/fistful',
        '/file_storage',
        '/deanonimus',
        '/payout/management',
    ],
    target: process.env.PROXY_TARGET,
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
};

if (!THRIFT_PROXY_CONFIG.target) throw new Error('proxy.conf.js - set the thrift proxy target!');

module.exports = [THRIFT_PROXY_CONFIG];
