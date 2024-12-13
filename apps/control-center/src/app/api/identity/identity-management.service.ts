import { Injectable } from '@angular/core';
import {
    identity_ManagementCodegenClient,
    ThriftAstMetadata,
    identity_Management,
} from '@vality/fistful-proto';
import * as identity from '@vality/fistful-proto/internal/identity';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class IdentityManagementService {
    private client$: Observable<identity_ManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('IdentityManagement')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                identity_Management({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Get(id: identity.IdentityID, range: identity.EventRange): Observable<identity.IdentityState> {
        return this.client$.pipe(switchMap((c) => c.Get(id, range)));
    }
}
