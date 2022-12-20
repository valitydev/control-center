import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    DominantCacheCodegenClient,
    DominantCache,
} from '@vality/dominant-cache-proto';
import { Category, ContractTemplate } from '@vality/dominant-cache-proto/dominant_cache';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class DominantCacheService {
    private client$: Observable<DominantCacheCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('DominantCache'))
        );
        const metadata$ = from(
            import('@vality/dominant-cache-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                DominantCache({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetCategories(): Observable<Category[]> {
        return this.client$.pipe(switchMap((c) => c.GetCategories()));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetContractTemplates(): Observable<ContractTemplate[]> {
        return this.client$.pipe(switchMap((c) => c.GetContractTemplates()));
    }
}
