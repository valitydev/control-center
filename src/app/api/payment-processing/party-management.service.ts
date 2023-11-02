import { Injectable } from '@angular/core';
import {
    payment_processing_PartyManagementCodegenClient,
    ThriftAstMetadata,
    payment_processing_PartyManagement,
} from '@vality/domain-proto';
import { Party, Shop, Contract } from '@vality/domain-proto/domain';
import { PartyID, ShopID, ContractID, ShopContract } from '@vality/domain-proto/payment_processing';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class PartyManagementService {
    private client$: Observable<payment_processing_PartyManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('PartyManagement', true)),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                payment_processing_PartyManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Get(partyId: PartyID): Observable<Party> {
        return this.client$.pipe(switchMap((c) => c.Get(partyId)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetContract(partyId: PartyID, contractId: ContractID): Observable<Contract> {
        return this.client$.pipe(switchMap((c) => c.GetContract(partyId, contractId)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetShop(partyId: PartyID, id: ShopID): Observable<Shop> {
        return this.client$.pipe(switchMap((c) => c.GetShop(partyId, id)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetShopContract(partyId: PartyID, id: ShopID): Observable<ShopContract> {
        return this.client$.pipe(switchMap((c) => c.GetShopContract(partyId, id)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SuspendShop(partyId: PartyID, id: ShopID): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.SuspendShop(partyId, id)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    ActivateShop(partyId: PartyID, id: ShopID): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.ActivateShop(partyId, id)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    BlockShop(partyId: PartyID, id: ShopID, reason: string): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.BlockShop(partyId, id, reason)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    UnblockShop(partyId: PartyID, id: ShopID, reason: string): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.UnblockShop(partyId, id, reason)));
    }
}
