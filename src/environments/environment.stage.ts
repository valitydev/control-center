import { Environment, DEFAULT_ENVIRONMENT } from './default-environment';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const environment: Environment = {
    ...DEFAULT_ENVIRONMENT,
    production: false,
    appConfigPath: '/assets/appConfig.stage.json',
    authConfigPath: '/assets/authConfig.stage.json',
};
