import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    deposit_Management,
    deposit_ManagementCodegenClient,
} from '@vality/fistful-proto';
import { DepositID, DepositParams } from '@vality/fistful-proto/deposit';
import { AdjustmentParams, AdjustmentState } from '@vality/fistful-proto/deposit_adjustment';
import { RevertParams, RevertState } from '@vality/fistful-proto/deposit_revert';
import { ContextSet } from '@vality/fistful-proto/internal/context';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../../services';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class DepositManagementService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<deposit_ManagementCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('DepositManagement')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                deposit_Management({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    CreateAdjustment(id: DepositID, params: AdjustmentParams): Observable<AdjustmentState> {
        return this.client$.pipe(switchMap((c) => c.CreateAdjustment(id, params)));
    }

    CreateRevert(id: DepositID, params: RevertParams): Observable<RevertState> {
        return this.client$.pipe(switchMap((c) => c.CreateRevert(id, params)));
    }

    Create(params: DepositParams, context: ContextSet) {
        return this.client$.pipe(switchMap((c) => c.Create(params, context)));
    }
}
