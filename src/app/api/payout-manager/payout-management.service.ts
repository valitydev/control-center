import { Injectable } from '@angular/core';
import {
    payout_manager_PayoutManagementCodegenClient,
    ThriftAstMetadata,
    payout_manager_PayoutManagement,
} from '@vality/payout-manager-proto';
import { PayoutParams, Payout, PayoutID } from '@vality/payout-manager-proto/payout_manager';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class PayoutManagementService {
    private client$: Observable<payout_manager_PayoutManagementCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('PayoutManagement')),
        );
        const metadata$ = from(
            import('@vality/payout-manager-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                payout_manager_PayoutManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreatePayout(payoutParams: PayoutParams): Observable<Payout> {
        return this.client$.pipe(switchMap((c) => c.CreatePayout(payoutParams)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetPayout(payoutId: PayoutID): Observable<Payout> {
        return this.client$.pipe(switchMap((c) => c.GetPayout(payoutId)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    ConfirmPayout(payoutId: PayoutID): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.ConfirmPayout(payoutId)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CancelPayout(payoutId: PayoutID, details: string): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.CancelPayout(payoutId, details)));
    }
}
