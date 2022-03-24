import { ObservableInput } from 'rxjs';

import { ThriftInstanceContext } from '@cc/app/api/utils';

export interface ProviderSettings {
    context: ThriftInstanceContext;
    defaultNamespace: string;
    metadataName?: string;
    metadataLoad?: () => ObservableInput<any>;
}
