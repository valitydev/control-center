import { Injectable } from '@angular/core';
import {
    withdrawal_ManagementCodegenClient,
    ThriftAstMetadata,
    withdrawal_Management,
} from '@vality/fistful-proto';
import { WithdrawalID, EventRange, WithdrawalState } from '@vality/fistful-proto/withdrawal';
import { AdjustmentState, AdjustmentParams } from '@vality/fistful-proto/withdrawal_adjustment';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private client$: Observable<withdrawal_ManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('WithdrawalManagement')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                withdrawal_Management({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateAdjustment(id: WithdrawalID, params: AdjustmentParams): Observable<AdjustmentState> {
        return this.client$.pipe(switchMap((c) => c.CreateAdjustment(id, params)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Get(id: WithdrawalID, range: EventRange): Observable<WithdrawalState> {
        return this.client$.pipe(switchMap((c) => c.Get(id, range)));
    }
}
