import { Injectable } from '@angular/core';
import {
    dominator_DominatorServiceCodegenClient,
    ThriftAstMetadata,
    dominator_DominatorService,
    dominator,
} from '@vality/dominator-proto';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class DominatorService {
    private client$: Observable<dominator_DominatorServiceCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchShopTermSets(shopSearchQuery: dominator.ShopSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchShopTermSets(shopSearchQuery)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchWalletTermSets(walletSearchQuery: dominator.WalletSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchWalletTermSets(walletSearchQuery)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchTerminalTermSets(terminalSearchQuery: dominator.TerminalSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchTerminalTermSets(terminalSearchQuery)));
    }
}
