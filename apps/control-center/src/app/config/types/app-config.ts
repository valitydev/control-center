interface Endpoint {
    hostname: string;
    path: string;
    port?: string;
    https?: boolean;
}

export interface AppConfig {
    api: {
        wachter: Endpoint;
    };
}
