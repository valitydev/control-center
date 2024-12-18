import { Injectable } from '@angular/core';
import {
    fistful_admin_FistfulAdminCodegenClient,
    ThriftAstMetadata,
    fistful_admin_FistfulAdmin,
} from '@vality/fistful-proto';
import { Deposit } from '@vality/fistful-proto/deposit';
import { DepositParams } from '@vality/fistful-proto/fistful_admin';
import { SourceParams } from '@vality/fistful-proto/internal/fistful_admin';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class FistfulAdminService {
    private client$: Observable<fistful_admin_FistfulAdminCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateDeposit(params: DepositParams): Observable<Deposit> {
        return this.client$.pipe(switchMap((c) => c.CreateDeposit(params)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateSource(params: SourceParams) {
        return this.client$.pipe(switchMap((c) => c.CreateSource(params)));
    }
}
