import { Injectable } from '@angular/core';
import { getImportValue } from '@vality/matez';
import {
    ThriftAstMetadata,
    account_balance_AccountService,
    account_balance_AccountServiceCodegenClient,
} from '@vality/scrooge-proto';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class AccountBalanceService {
    private client$: Observable<account_balance_AccountServiceCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(map(toWachterHeaders('Scrooge')));
        const metadata$ = getImportValue<ThriftAstMetadata[]>(
            import('@vality/scrooge-proto/metadata.json'),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                account_balance_AccountService({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetTerminalBalances() {
        return this.client$.pipe(switchMap((c) => c.GetAccountBalances()));
    }
}
