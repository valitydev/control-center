import { environment as prodEnvironment } from './environment.prod';
import { Environment } from './types/environment';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const environment: Environment = {
    ...prodEnvironment,
    production: false,
    logging: {
        requests: true,
    },
    ignoreRoles: true,
};
