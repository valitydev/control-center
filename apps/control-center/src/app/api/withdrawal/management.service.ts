import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    withdrawal_Management,
    withdrawal_ManagementCodegenClient,
} from '@vality/fistful-proto';
import { EventRange, WithdrawalID, WithdrawalState } from '@vality/fistful-proto/withdrawal';
import { AdjustmentParams, AdjustmentState } from '@vality/fistful-proto/withdrawal_adjustment';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private client$: Observable<withdrawal_ManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
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
