import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    fistful_admin_FistfulAdmin,
    fistful_admin_FistfulAdminCodegenClient,
} from '@vality/fistful-proto';
import { Deposit } from '@vality/fistful-proto/deposit';
import { DepositParams } from '@vality/fistful-proto/fistful_admin';
import { SourceParams } from '@vality/fistful-proto/internal/fistful_admin';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../../services';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class FistfulAdminService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<fistful_admin_FistfulAdminCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('FistfulAdmin')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                fistful_admin_FistfulAdmin({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    CreateDeposit(params: DepositParams): Observable<Deposit> {
        return this.client$.pipe(switchMap((c) => c.CreateDeposit(params)));
    }

    CreateSource(params: SourceParams) {
        return this.client$.pipe(switchMap((c) => c.CreateSource(params)));
    }
}
