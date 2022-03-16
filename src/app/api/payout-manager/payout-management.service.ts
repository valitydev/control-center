import { Injectable } from '@angular/core';
import * as ThriftPayoutManagementService from '@vality/magista-proto/lib/magista/gen-nodejs/PayoutManagement';
import { Payout, PayoutID, PayoutParams } from '@vality/payout-manager-proto';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ThriftConnector } from '@cc/app/api/thrift-connector';
import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { PayoutManagerInstanceProviderService } from './payout-manager-instance-provider.service';

@Injectable({
    providedIn: 'root',
})
export class PayoutManagementService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: PayoutManagerInstanceProviderService
    ) {
        super(keycloakTokenInfoService, ThriftPayoutManagementService, '/payout/management');
    }

    createPayout(params: PayoutParams): Observable<Payout> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject, toThriftInstance }) =>
                this.callThriftServiceMethod<Payout>(
                    'CreatePayout',
                    toThriftInstance('PayoutParams', params)
                ).pipe(map((v) => toPlainObject('Payout', v)))
            )
        );
    }

    getPayout(id: PayoutID): Observable<Payout> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject, toThriftInstance }) =>
                this.callThriftServiceMethod<Payout>(
                    'GetPayout',
                    toThriftInstance('PayoutID', id)
                ).pipe(map((v) => toPlainObject('Payout', v)))
            )
        );
    }

    confirmPayout(id: PayoutID): Observable<void> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toThriftInstance }) =>
                this.callThriftServiceMethod<void>(
                    'ConfirmPayout',
                    toThriftInstance('PayoutID', id)
                )
            )
        );
    }

    cancelPayout(id: PayoutID, details: string): Observable<void> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toThriftInstance }) =>
                this.callThriftServiceMethod<void>(
                    'CancelPayout',
                    toThriftInstance('PayoutID', id),
                    details
                )
            )
        );
    }
}
