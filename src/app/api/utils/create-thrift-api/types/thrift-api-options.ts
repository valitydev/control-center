import { ThriftService } from '@cc/app/api/utils/thrift-connector/utils';

export interface ThriftApiOptions {
    name: string;
    service: ThriftService;
    serviceName: string;
    endpoint: string;
    metadata: () => Promise<any>;
    context: any;
    functions: string[];
    deprecatedHeaders?: boolean;
}
