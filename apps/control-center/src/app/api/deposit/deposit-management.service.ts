import { Injectable } from '@angular/core';
import {
    deposit_ManagementCodegenClient,
    ThriftAstMetadata,
    deposit_Management,
} from '@vality/fistful-proto';
import { DepositID, DepositParams } from '@vality/fistful-proto/deposit';
import { AdjustmentParams, AdjustmentState } from '@vality/fistful-proto/deposit_adjustment';
import { RevertParams, RevertState } from '@vality/fistful-proto/deposit_revert';
import { ContextSet } from '@vality/fistful-proto/internal/context';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class DepositManagementService {
    private client$: Observable<deposit_ManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateAdjustment(id: DepositID, params: AdjustmentParams): Observable<AdjustmentState> {
        return this.client$.pipe(switchMap((c) => c.CreateAdjustment(id, params)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateRevert(id: DepositID, params: RevertParams): Observable<RevertState> {
        return this.client$.pipe(switchMap((c) => c.CreateRevert(id, params)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Create(params: DepositParams, context: ContextSet) {
        return this.client$.pipe(switchMap((c) => c.Create(params, context)));
    }
}
