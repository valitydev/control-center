import { DEFAULT_ENVIRONMENT, Environment } from './default-environment';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const environment: Environment = {
    ...DEFAULT_ENVIRONMENT,
    production: true,
};
