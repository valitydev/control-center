import { Injectable, Injector } from '@angular/core';
import { codegenClientConfig, CodegenClient } from '@vality/fistful-proto/lib/wallet-Management';
import context from '@vality/fistful-proto/lib/wallet/context';
import * as Management from '@vality/fistful-proto/lib/wallet/gen-nodejs/Management';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class ManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: Management,
            path: '/v1/wallet',
            metadata: () =>
                import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
