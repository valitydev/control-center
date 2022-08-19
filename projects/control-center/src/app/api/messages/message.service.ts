import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/messages-proto/lib/messages-MessageService';
import context from '@vality/messages-proto/lib/messages/context';
import * as service from '@vality/messages-proto/lib/messages/gen-nodejs/MessageService';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class MessageService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            path: '/v1/messages',
            metadata: () =>
                import('@vality/messages-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
