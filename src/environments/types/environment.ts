export interface Environment {
    production: boolean;
    appConfigPath: string;
    authConfigPath: string;
    logging: {
        requests?: boolean;
    };
    // not available in production
    ignoreRoles?: boolean;
}
