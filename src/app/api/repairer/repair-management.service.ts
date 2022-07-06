import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/repairer-proto/lib/repairer-RepairManagement';
import context from '@vality/repairer-proto/lib/repairer/context';
import * as service from '@vality/repairer-proto/lib/repairer/gen-nodejs/RepairManagement';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class RepairManagementService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            path: '/v1/repairer', // TODO
            metadata: () =>
                import('@vality/repairer-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
