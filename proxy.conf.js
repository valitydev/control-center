require('dotenv').config();

const { PROXY_TARGET } = process.env;
const REQUIRED_ENV = [PROXY_TARGET];

if (REQUIRED_ENV.findIndex((e) => !e) !== -1) {
    throw new Error('[proxy.conf.js] Set required environment variables!');
}

module.exports = [
    {
        context: [
            '/v1',
            '/v3',
            '/stat',
            '/fistful',
            '/file_storage',
            '/deanonimus',
            '/payout/management',
            '/wachter',
        ],
        target: PROXY_TARGET,
        secure: false,
        logLevel: 'debug',
        changeOrigin: true,
    },
];
