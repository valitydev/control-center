import { Injectable } from '@angular/core';
import {
    accounter_AccounterCodegenClient,
    ThriftAstMetadata,
    accounter_Accounter,
} from '@vality/domain-proto';
import { Account } from '@vality/domain-proto/internal/accounter';
import { AccountID } from '@vality/domain-proto/internal/domain';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class AccounterService {
    private client$: Observable<accounter_AccounterCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('Accounter')),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                accounter_Accounter({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetAccountByID(id: AccountID): Observable<Account> {
        return this.client$.pipe(switchMap((c) => c.GetAccountByID(id)));
    }
}
