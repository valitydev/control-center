import { Injectable, inject } from '@angular/core';
import {
    domain_config_v2_RepositoryCodegenClient as CodegenClient,
    ThriftAstMetadata,
    domain_config_v2_Repository,
} from '@vality/domain-proto';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class Repository2Service {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<CodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(map(toWachterHeaders('DMT')));
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                domain_config_v2_Repository({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    GetLatestVersion(...params: Parameters<CodegenClient['GetLatestVersion']>) {
        return this.client$.pipe(switchMap((c) => c.GetLatestVersion(...params)));
    }

    Commit(...params: Parameters<CodegenClient['Commit']>) {
        return this.client$.pipe(switchMap((c) => c.Commit(...params)));
    }

    GetObjectHistory(...params: Parameters<CodegenClient['GetObjectHistory']>) {
        return this.client$.pipe(switchMap((c) => c.GetObjectHistory(...params)));
    }

    GetAllObjectsHistory(...params: Parameters<CodegenClient['GetAllObjectsHistory']>) {
        return this.client$.pipe(switchMap((c) => c.GetAllObjectsHistory(...params)));
    }

    SearchObjects(...params: Parameters<CodegenClient['SearchObjects']>) {
        return this.client$.pipe(switchMap((c) => c.SearchObjects(...params)));
    }

    SearchFullObjects(...params: Parameters<CodegenClient['SearchFullObjects']>) {
        return this.client$.pipe(switchMap((c) => c.SearchFullObjects(...params)));
    }
}
