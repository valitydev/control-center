import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/payout-manager-proto/lib/payout_manager-PayoutManagement';
import context from '@vality/payout-manager-proto/lib/payout_manager/context';
import * as PayoutManagement from '@vality/payout-manager-proto/lib/payout_manager/gen-nodejs/PayoutManagement';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class PayoutManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: PayoutManagement,
            wachterServiceName: 'PayoutManagement',
            metadata: () =>
                import('@vality/payout-manager-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
