import { SubscribableOrPromise } from 'rxjs/src/internal/types';

import { ThriftInstanceContext } from '../../../thrift-services';

export interface ProviderSettings {
    context: ThriftInstanceContext;
    defaultNamespace: string;
    metadataName?: string;
    metadataLoad?: () => SubscribableOrPromise<any>;
}
