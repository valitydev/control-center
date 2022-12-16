import { Injectable } from '@angular/core';
import { RepositoryCodegenClient, ThriftAstMetadata, Repository } from '@vality/domain-proto';
import { Version, Commit, Reference, Snapshot } from '@vality/domain-proto/domain_config';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class RepositoryService {
    private client$: Observable<RepositoryCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('Domain'))
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                Repository({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Commit(version: Version, commit: Commit): Observable<Version> {
        return this.client$.pipe(switchMap((c) => c.Commit(version, commit)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Checkout(reference: Reference): Observable<Snapshot> {
        return this.client$.pipe(switchMap((c) => c.Checkout(reference)));
    }
}
