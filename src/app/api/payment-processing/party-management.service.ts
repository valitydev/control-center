import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ThriftConnector } from '@cc/app/api/thrift-connector';
import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import {
    Contract,
    ContractID,
    Party,
    PartyID,
    Shop,
    ShopID,
} from '../../thrift-services/damsel/gen-model/domain';
import { UserInfo } from '../../thrift-services/damsel/gen-model/payment_processing';
import * as ThriftPartyManagementService from '../../thrift-services/damsel/gen-nodejs/PartyManagement';
import { PaymentProcessingInstanceProviderService } from './payment-processing-instance-provider.service';

@Injectable({
    providedIn: 'root',
})
export class PartyManagementService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: PaymentProcessingInstanceProviderService
    ) {
        super(keycloakTokenInfoService, ThriftPartyManagementService, '/v1/processing/partymgmt');
    }

    get(partyId: PartyID): Observable<Party> {
        return forkJoin([this.instanceProvider.methods$, this.getUserInfo()]).pipe(
            switchMap(([{ toPlainObject }, userInfo]) =>
                this.callThriftServiceMethod<Party>('Get', userInfo, partyId).pipe(
                    map((v) => toPlainObject('domain.Party', v))
                )
            )
        );
    }

    getShop(partyId: PartyID, id: ShopID): Observable<Shop> {
        return forkJoin([this.instanceProvider.methods$, this.getUserInfo()]).pipe(
            switchMap(([{ toPlainObject }, userInfo]) =>
                this.callThriftServiceMethod<Shop>('GetShop', userInfo, partyId, id).pipe(
                    map((v) => toPlainObject('domain.Shop', v))
                )
            )
        );
    }

    getContract(partyId: PartyID, id: ContractID): Observable<Contract> {
        return forkJoin([this.instanceProvider.methods$, this.getUserInfo()]).pipe(
            switchMap(([{ toPlainObject }, userInfo]) =>
                this.callThriftServiceMethod<Contract>('GetContract', userInfo, partyId, id).pipe(
                    map((v) => toPlainObject('domain.Contract', v))
                )
            )
        );
    }

    private getUserInfo(): Observable<UserInfo> {
        return forkJoin([
            this.instanceProvider.methods$,
            this.keycloakTokenInfoService.decoded$,
        ]).pipe(
            map(([{ toThriftInstance }, { sub }]) =>
                toThriftInstance('UserInfo', { id: sub, type: { internal_user: {} } })
            )
        );
    }
}
