import { Injectable } from '@angular/core';

import { ProviderSettings, ThriftInstanceProvider } from '../../thrift-instance-provider';
import * as base from './gen-nodejs/base_types';
import * as wallet from './gen-nodejs/wallet_types';

@Injectable({ providedIn: 'root' })
export class WalletInstanceProvider extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context: {
                base,
                wallet,
            },
            metadataName: 'fistful',
            defaultNamespace: 'wallet',
        };
    }
}
