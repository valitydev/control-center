import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/magista-proto/lib/magista-MerchantStatisticsService';
import context from '@vality/magista-proto/lib/magista/context';
import * as ThriftMerchantStatisticsService from '@vality/magista-proto/lib/magista/gen-nodejs/MerchantStatisticsService';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class MerchantStatisticsService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service: ThriftMerchantStatisticsService,
            wachterServiceName: 'MerchantStatistics',
            metadata: () =>
                import('@vality/magista-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
