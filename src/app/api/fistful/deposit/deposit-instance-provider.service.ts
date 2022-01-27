import { Injectable } from '@angular/core';

import { ProviderSettings, ThriftInstanceProvider } from '../../thrift-instance-provider';
import * as deposit_revert from './gen-nodejs/deposit_revert_types';

@Injectable({ providedIn: 'root' })
export class DepositInstanceProvider extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context: {
                deposit_revert,
            },
            metadataName: 'fistful',
            defaultNamespace: 'deposit_revert',
        };
    }
}
