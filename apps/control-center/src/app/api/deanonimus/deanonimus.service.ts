import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    deanonimus_Deanonimus,
    deanonimus_DeanonimusCodegenClient,
} from '@vality/deanonimus-proto';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class DeanonimusService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<deanonimus_DeanonimusCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
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

    searchWalletText(text: string) {
        return this.client$.pipe(switchMap((c) => c.searchWalletText(text)));
    }
}
