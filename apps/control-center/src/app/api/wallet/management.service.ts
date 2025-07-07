import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    wallet_Management,
    wallet_ManagementCodegenClient,
} from '@vality/fistful-proto';
import { ContextSet } from '@vality/fistful-proto/internal/context';
import { AccountBalance, WalletParams } from '@vality/fistful-proto/internal/wallet';
import { EventRange, WalletID, WalletState } from '@vality/fistful-proto/wallet';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../../services/config';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<wallet_ManagementCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('WalletManagement')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                wallet_Management({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    Get(id: WalletID, range: EventRange): Observable<WalletState> {
        return this.client$.pipe(switchMap((c) => c.Get(id, range)));
    }

    Create(params: WalletParams, context: ContextSet): Observable<WalletState> {
        return this.client$.pipe(switchMap((c) => c.Create(params, context)));
    }

    GetAccountBalance(id: WalletID): Observable<AccountBalance> {
        return this.client$.pipe(switchMap((c) => c.GetAccountBalance(id)));
    }
}
