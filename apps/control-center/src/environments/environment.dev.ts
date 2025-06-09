import { environment as prodEnvironment } from './environment.prod';
import { Environment } from './types/environment';

export const environment: Environment = {
    ...prodEnvironment,
    production: false,
    logging: {
        requests: true,
    },
    ignoreRoles: true,
    domain2: true,
};
