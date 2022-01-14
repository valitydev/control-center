import { Injectable } from '@angular/core';

import { ProviderSettings, ThriftInstanceProvider } from '../../thrift-instance-provider';
import * as dominant_cache from './gen-nodejs/dominant_cache_types';

@Injectable({ providedIn: 'root' })
export class DominantCacheInstanceProvider extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context: {
                dominant_cache,
            },
            metadataName: 'dominant-cache',
            defaultNamespace: 'dominant_cache',
        };
    }
}
