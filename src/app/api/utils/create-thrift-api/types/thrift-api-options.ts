import { ThriftService } from '@cc/app/api/utils/thrift-connector/utils';

export interface ThriftApiOptions {
    name: string;
    service: ThriftService;
    serviceName: string;
    path: string;
    hostname?: string;
    port?: string;
    metadata: () => Promise<any>;
    context: any;
    functions: string[];
    deprecatedHeaders?: boolean;
}
