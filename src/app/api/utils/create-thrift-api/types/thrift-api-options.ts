import { ThriftClientMainOptions } from '../utils';

export interface ThriftApiOptions extends ThriftClientMainOptions {
    name: string;
    serviceName: string;
    wachterServiceName?: string;
    metadata: () => Promise<any>;
    context: any;
    functions: string[];
    deprecatedHeaders?: boolean;
}
