import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/domain-proto/lib/claim_management-ClaimManagement';
import context from '@vality/domain-proto/lib/claim_management/context';
import * as service from '@vality/domain-proto/lib/claim_management/gen-nodejs/ClaimManagement';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class ClaimManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            path: '/v1/cm',
            metadata: () => import('@vality/domain-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
