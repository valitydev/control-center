import { Injectable } from '@angular/core';
import { getImportValue } from '@vality/ng-core';
import {
    terminal_balance_TerminalServiceCodegenClient,
    ThriftAstMetadata,
    terminal_balance_TerminalService,
} from '@vality/scrooge-proto';
import { combineLatest, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class TerminalBalanceService {
    private client$: Observable<terminal_balance_TerminalServiceCodegenClient>;

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
                terminal_balance_TerminalService({
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
        return this.client$.pipe(switchMap((c) => c.GetTerminalBalances()));
    }
}
