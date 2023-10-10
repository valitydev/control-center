interface Endpoint {
    hostname: string;
    path: string;
    port?: string;
    https?: boolean;
}

export interface AppConfig {
    fileStorageEndpoint: string;
    api: {
        wachter: Endpoint;
    };
}
