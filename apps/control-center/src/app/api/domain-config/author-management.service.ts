import { Injectable } from '@angular/core';
import {
    domain_config_v2_AuthorManagementCodegenClient as CodegenClient,
    ThriftAstMetadata,
    domain_config_v2_AuthorManagement,
} from '@vality/domain-proto';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class AuthorManagementService {
    private client$: Observable<CodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('DMTAuthor')),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                domain_config_v2_AuthorManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    Create(...params: Parameters<CodegenClient['Create']>) {
        return this.client$.pipe(switchMap((c) => c.Create(...params)));
    }

    Delete(...params: Parameters<CodegenClient['Delete']>) {
        return this.client$.pipe(switchMap((c) => c.Delete(...params)));
    }

    Get(...params: Parameters<CodegenClient['Get']>) {
        return this.client$.pipe(switchMap((c) => c.Get(...params)));
    }

    GetByEmail(...params: Parameters<CodegenClient['GetByEmail']>) {
        return this.client$.pipe(switchMap((c) => c.GetByEmail(...params)));
    }
}
