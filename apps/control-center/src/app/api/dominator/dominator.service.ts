import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    dominator,
    dominator_DominatorService,
    dominator_DominatorServiceCodegenClient,
} from '@vality/dominator-proto';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class DominatorService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<dominator_DominatorServiceCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('Dominator')),
        );
        const metadata$ = from(
            import('@vality/dominator-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                dominator_DominatorService({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    SearchShopTermSets(shopSearchQuery: dominator.ShopSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchShopTermSets(shopSearchQuery)));
    }

    SearchWalletTermSets(walletSearchQuery: dominator.WalletSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchWalletTermSets(walletSearchQuery)));
    }

    SearchTerminalTermSets(terminalSearchQuery: dominator.TerminalSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchTerminalTermSets(terminalSearchQuery)));
    }
}
