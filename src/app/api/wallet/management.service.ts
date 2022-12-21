import { Injectable } from '@angular/core';
import {
    wallet_ManagementCodegenClient,
    ThriftAstMetadata,
    wallet_Management,
} from '@vality/fistful-proto';
import { WalletID, EventRange, WalletState } from '@vality/fistful-proto/wallet';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private client$: Observable<wallet_ManagementCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('WalletManagement'))
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                wallet_Management({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Get(id: WalletID, range: EventRange): Observable<WalletState> {
        return this.client$.pipe(switchMap((c) => c.Get(id, range)));
    }
}
