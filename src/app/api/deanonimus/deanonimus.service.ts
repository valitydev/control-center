import { Injectable } from '@angular/core';
import {
    deanonimus_DeanonimusCodegenClient,
    ThriftAstMetadata,
    deanonimus_Deanonimus,
} from '@vality/deanonimus-proto';
import { SearchHit } from '@vality/deanonimus-proto/deanonimus';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class DeanonimusService {
    private client$: Observable<deanonimus_DeanonimusCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('Deanonimus'))
        );
        const metadata$ = from(
            import('@vality/deanonimus-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                deanonimus_Deanonimus({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    searchParty(text: string): Observable<SearchHit[]> {
        return this.client$.pipe(switchMap((c) => c.searchParty(text)));
    }
}
