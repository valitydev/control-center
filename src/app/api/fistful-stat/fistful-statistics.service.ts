import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/fistful-proto/lib/fistful_stat-FistfulStatistics';
import context from '@vality/fistful-proto/lib/fistful_stat/context';
import * as service from '@vality/fistful-proto/lib/fistful_stat/gen-nodejs/FistfulStatistics';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class FistfulStatisticsService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            wachterServiceName: 'FistfulStatistics',
            metadata: () =>
                import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
