import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/deanonimus-proto/lib/deanonimus-Deanonimus';
import context from '@vality/deanonimus-proto/lib/deanonimus/context';
import * as service from '@vality/deanonimus-proto/lib/deanonimus/gen-nodejs/Deanonimus';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class DeanonimusService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            wachterServiceName: 'Deanonimus',
            metadata: () =>
                import('@vality/deanonimus-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
