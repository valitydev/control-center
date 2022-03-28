import { Injectable, Injector } from '@angular/core';
import { codegenClientConfig, CodegenClient } from '@vality/fistful-proto/lib/deposit-Management';
import context from '@vality/fistful-proto/lib/deposit/context';
import * as Management from '@vality/fistful-proto/lib/deposit/gen-nodejs/Management';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class ManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: Management,
            endpoint: '/v1/deposit',
            metadata: () =>
                import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
