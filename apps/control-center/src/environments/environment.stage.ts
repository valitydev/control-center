import { environment as devEnvironment } from './environment.dev';
import { Environment } from './types/environment';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const environment: Environment = {
    ...devEnvironment,
    appConfigPath: '/assets/appConfig.stage.json',
    authConfigPath: '/assets/authConfig.stage.json',
};
