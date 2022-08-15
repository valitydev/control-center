import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/domain-proto/lib/payment_processing-Invoicing';
import context from '@vality/domain-proto/lib/payment_processing/context';
import * as service from '@vality/domain-proto/lib/payment_processing/gen-nodejs/Invoicing';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class InvoicingService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            path: '/v1/processing/invoicing',
            metadata: () => import('@vality/domain-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
