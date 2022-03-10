import { Injectable } from '@angular/core';
import * as context from '@vality/payout-manager-proto/lib/payout_manager/context.js';

import { ProviderSettings, ThriftInstanceProvider } from '../thrift-instance-provider';

@Injectable({ providedIn: 'root' })
export class PayoutManagerInstanceProviderService extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context,
            metadataLoad: () =>
                import('@vality/payout-manager-proto/lib/metadata.json').then((m) => m.default),
            defaultNamespace: 'payout_manager',
        };
    }
}
