import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { ThriftConnector } from '../../thrift-connector';
import { WalletState, EventRange as EventRangeModel } from '../gen-model/wallet';
import { EventRange } from './gen-nodejs/base_types';
import * as Management from './gen-nodejs/Management';
import { WalletInstanceProvider } from './wallet-instance-provider.service';

@Injectable({
    providedIn: 'root',
})
export class WalletManagementService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: WalletInstanceProvider
    ) {
        super(keycloakTokenInfoService, Management, '/v1/wallet');
    }

    get(walletID: string, range: EventRangeModel = new EventRange()): Observable<WalletState> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject, toThriftInstance }) =>
                this.callThriftServiceMethod<WalletState>(
                    'Get',
                    walletID,
                    toThriftInstance('EventRange', range)
                ).pipe(map((v) => toPlainObject('WalletState', v)))
            )
        );
    }
}
