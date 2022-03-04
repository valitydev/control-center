import { ObservableInput } from 'rxjs';

import { ThriftInstanceContext } from '../../../thrift-services';

export interface ProviderSettings {
    context: ThriftInstanceContext;
    defaultNamespace: string;
    metadataName?: string;
    metadataLoad?: () => ObservableInput<any>;
}
