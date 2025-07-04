import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    domain_config_Repository,
    domain_config_RepositoryCodegenClient,
} from '@vality/domain-proto';
import { Commit, Reference, Snapshot, Version } from '@vality/domain-proto/domain_config';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class RepositoryService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<domain_config_RepositoryCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(map(toWachterHeaders('Domain')));
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                domain_config_Repository({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    Commit(version: Version, commit: Commit): Observable<Version> {
        return this.client$.pipe(switchMap((c) => c.Commit(version, commit)));
    }

    Checkout(reference: Reference): Observable<Snapshot> {
        return this.client$.pipe(switchMap((c) => c.Checkout(reference)));
    }
}
