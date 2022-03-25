import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/domain-proto/lib/domain_config-Repository';
import context from '@vality/domain-proto/lib/domain_config/context';
import * as Repository from '@vality/domain-proto/lib/domain_config/gen-nodejs/Repository';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class RepositoryService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: Repository,
            endpoint: '/v1/domain/repository',
            metadata: () => import('@vality/domain-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
