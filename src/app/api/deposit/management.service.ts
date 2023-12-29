import { Injectable } from '@angular/core';
import {
    deposit_ManagementCodegenClient,
    ThriftAstMetadata,
    deposit_Management,
} from '@vality/fistful-proto';
import { DepositID } from '@vality/fistful-proto/deposit';
import { AdjustmentParams, AdjustmentState } from '@vality/fistful-proto/deposit_adjustment';
import { RevertParams, RevertState } from '@vality/fistful-proto/deposit_revert';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class ManagementService {
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
}
