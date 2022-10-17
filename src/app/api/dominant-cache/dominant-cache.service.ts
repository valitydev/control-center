import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/dominant-cache-proto/lib/dominant_cache-DominantCache';
import context from '@vality/dominant-cache-proto/lib/dominant_cache/context';
import * as DominantCache from '@vality/dominant-cache-proto/lib/dominant_cache/gen-nodejs/DominantCache';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class DominantCacheService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: DominantCache,
            wachterServiceName: 'DominantCache',
            metadata: () =>
                import('@vality/dominant-cache-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
