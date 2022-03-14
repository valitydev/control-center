import { Injectable } from '@angular/core';
import { StatPayoutResponse, PayoutSearchQuery } from '@vality/magista-proto';
import * as ThriftMerchantStatisticsService from '@vality/magista-proto/lib/magista/gen-nodejs/MerchantStatisticsService';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ThriftConnector } from '@cc/app/api/thrift-connector';
import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { MagistaInstanceProviderService } from './magista-instance-provider.service';

@Injectable({
    providedIn: 'root',
})
export class MerchantStatisticsService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: MagistaInstanceProviderService
    ) {
        super(keycloakTokenInfoService, ThriftMerchantStatisticsService, '/v3/stat');
    }

    searchPayouts(payoutSearchQuery: PayoutSearchQuery): Observable<StatPayoutResponse> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject, toThriftInstance }) =>
                this.callThriftServiceMethod<StatPayoutResponse>(
                    'SearchPayouts',
                    toThriftInstance('PayoutSearchQuery', payoutSearchQuery)
                ).pipe(map((v) => toPlainObject('StatPayoutResponse', v)))
            )
        );
    }
}
