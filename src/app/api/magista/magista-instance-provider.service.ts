import { Injectable } from '@angular/core';
import * as context from '@vality/magista-proto/lib/magista/context.js';

import { ProviderSettings, ThriftInstanceProvider } from '../thrift-instance-provider';

@Injectable({ providedIn: 'root' })
export class MagistaInstanceProviderService extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context,
            metadataName: 'magista',
            defaultNamespace: 'magista',
        };
    }
}
