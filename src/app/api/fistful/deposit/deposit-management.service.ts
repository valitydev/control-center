import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { ThriftConnector } from '../../thrift-connector';
import { RevertParams, RevertState } from '../gen-model/deposit_revert';
import { DepositInstanceProvider } from './deposit-instance-provider.service';
import * as Management from './gen-nodejs/Management';

@Injectable({ providedIn: 'root' })
export class DepositManagementService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: DepositInstanceProvider
    ) {
        super(keycloakTokenInfoService, Management, '/v1/deposit');
    }

    createRevert(depositID: string, revertParams: RevertParams): Observable<RevertState> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject, toThriftInstance }) =>
                this.callThriftServiceMethod<RevertState>(
                    'CreateRevert',
                    depositID,
                    toThriftInstance('RevertParams', revertParams)
                ).pipe(map((v) => toPlainObject('RevertState', v)))
            )
        );
    }
}
