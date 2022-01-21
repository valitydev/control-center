import { Injectable } from '@angular/core';

import { ProviderSettings, ThriftInstanceProvider } from '../../thrift-instance-provider';
import * as wallet from './gen-nodejs/wallet_types';

@Injectable({ providedIn: 'root' })
export class WalletInstanceProvider extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context: {
                wallet,
            },
            metadataName: 'fistful',
            defaultNamespace: 'wallet',
        };
    }
}
