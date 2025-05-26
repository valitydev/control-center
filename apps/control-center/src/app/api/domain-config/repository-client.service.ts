import { Injectable } from '@angular/core';
import {
    domain_config_v2_RepositoryClientCodegenClient as CodegenClient,
    ThriftAstMetadata,
    domain_config_v2_RepositoryClient,
} from '@vality/domain-proto';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class RepositoryClientService {
    private client$: Observable<CodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('DMTClient')),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                domain_config_v2_RepositoryClient({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    CheckoutObject(...params: Parameters<CodegenClient['CheckoutObject']>) {
        return this.client$.pipe(switchMap((c) => c.CheckoutObject(...params)));
    }
}
