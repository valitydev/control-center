export interface AppConfig {
    fileStorageEndpoint: string;
    constants: {
        currencies: { source: string; currency: string }[];
    };
}
