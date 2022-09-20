import { Overwrite } from 'utility-types';

import { ThriftInstanceContext } from '../../thrift-instance';
import { ThriftClientMainOptions } from '../utils';

export interface ThriftApiOptions extends Overwrite<ThriftClientMainOptions, { path?: string }> {
    name: string;
    serviceName: string;
    // https://github.com/valitydev/wachter/blob/master/src/main/resources/application.yml
    wachterServiceName?: string;
    metadata: () => Promise<unknown>;
    context: ThriftInstanceContext;
    functions: string[];
    deprecatedHeaders?: boolean;
}
