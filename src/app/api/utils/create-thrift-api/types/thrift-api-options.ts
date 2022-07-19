export interface ThriftApiOptions {
    name: string;
    service: object;
    serviceName: string;
    path: string;
    wachterServiceName?: string;
    hostname?: string;
    port?: string;
    metadata: () => Promise<any>;
    context: any;
    functions: string[];
    deprecatedHeaders?: boolean;
}
