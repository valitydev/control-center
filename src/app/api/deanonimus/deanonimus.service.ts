import { Injectable } from '@angular/core';
import {
    deanonimus_DeanonimusCodegenClient,
    ThriftAstMetadata,
    deanonimus_Deanonimus,
} from '@vality/deanonimus-proto';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class DeanonimusService {
    private client$: Observable<deanonimus_DeanonimusCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('Deanonimus')),
        );
        const metadata$ = from(
            import('@vality/deanonimus-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                deanonimus_Deanonimus({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    searchParty(text: string) {
        return this.client$.pipe(switchMap((c) => c.searchParty(text)));
    }

    searchShopText(text: string) {
        return this.client$.pipe(switchMap((c) => c.searchShopText(text)));
    }
}
