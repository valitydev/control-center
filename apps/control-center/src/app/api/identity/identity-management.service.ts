import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    identity_Management,
    identity_ManagementCodegenClient,
} from '@vality/fistful-proto';
import * as identity from '@vality/fistful-proto/internal/identity';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../config';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class IdentityManagementService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<identity_ManagementCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
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

    Get(id: identity.IdentityID, range: identity.EventRange): Observable<identity.IdentityState> {
        return this.client$.pipe(switchMap((c) => c.Get(id, range)));
    }
}
