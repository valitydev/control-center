import { ThriftInstanceContext } from '../../thrift-instance';
import { ThriftClientMainOptions } from '../utils';

export interface ThriftApiOptions extends ThriftClientMainOptions {
    name: string;
    serviceName: string;
    wachterServiceName?: string;
    metadata: () => Promise<unknown>;
    context: ThriftInstanceContext;
    functions: string[];
    deprecatedHeaders?: boolean;
}
