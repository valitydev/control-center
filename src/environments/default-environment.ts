export const DEFAULT_ENVIRONMENT: Environment = {
    production: true,
    appConfigPath: '/assets/appConfig.json',
    authConfigPath: '/assets/authConfig.json',
};

export interface Environment {
    production: boolean;
    appConfigPath: string;
    authConfigPath: string;
}
