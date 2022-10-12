import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/domain-proto/lib/payment_processing-PartyManagement';
import context from '@vality/domain-proto/lib/payment_processing/context';
import * as PartyManagement from '@vality/domain-proto/lib/payment_processing/gen-nodejs/PartyManagement';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class PartyManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: PartyManagement,
            wachterServiceName: 'PartyManagement',
            metadata: () => import('@vality/domain-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
