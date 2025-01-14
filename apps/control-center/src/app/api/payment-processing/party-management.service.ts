import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    payment_processing_PartyManagement,
    payment_processing_PartyManagementCodegenClient,
} from '@vality/domain-proto';
import { Contract, Party, Shop } from '@vality/domain-proto/domain';
import { ContractID, PartyID, ShopContract, ShopID } from '@vality/domain-proto/payment_processing';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class PartyManagementService {
    private client$: Observable<payment_processing_PartyManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('PartyManagement')),
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

    Get(partyId: PartyID): Observable<Party> {
        return this.client$.pipe(switchMap((c) => c.Get(partyId)));
    }

    GetContract(partyId: PartyID, contractId: ContractID): Observable<Contract> {
        return this.client$.pipe(switchMap((c) => c.GetContract(partyId, contractId)));
    }

    GetShop(partyId: PartyID, id: ShopID): Observable<Shop> {
        return this.client$.pipe(switchMap((c) => c.GetShop(partyId, id)));
    }

    GetShopContract(partyId: PartyID, id: ShopID): Observable<ShopContract> {
        return this.client$.pipe(switchMap((c) => c.GetShopContract(partyId, id)));
    }

    SuspendShop(partyId: PartyID, id: ShopID): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.SuspendShop(partyId, id)));
    }

    ActivateShop(partyId: PartyID, id: ShopID): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.ActivateShop(partyId, id)));
    }

    BlockShop(partyId: PartyID, id: ShopID, reason: string): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.BlockShop(partyId, id, reason)));
    }

    UnblockShop(partyId: PartyID, id: ShopID, reason: string): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.UnblockShop(partyId, id, reason)));
    }
}
