import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/fistful-proto/lib/withdrawal-Management';
import context from '@vality/fistful-proto/lib/withdrawal/context';
import * as service from '@vality/fistful-proto/lib/withdrawal/gen-nodejs/Management';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class ManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            wachterServiceName: 'WithdrawalManagement',
            metadata: () =>
                import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
