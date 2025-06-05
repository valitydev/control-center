export interface Environment {
    production: boolean;
    appConfigPath: string;
    authConfigPath: string;
    logging: {
        requests?: boolean;
    };
    domain2?: boolean;
    // not available in production
    ignoreRoles?: boolean;
}
