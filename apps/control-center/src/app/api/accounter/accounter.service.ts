import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    accounter_Accounter,
    accounter_AccounterCodegenClient,
} from '@vality/domain-proto';
import { Account } from '@vality/domain-proto/internal/accounter';
import { AccountID } from '@vality/domain-proto/internal/domain';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class AccounterService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<accounter_AccounterCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
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

    GetAccountByID(id: AccountID): Observable<Account> {
        return this.client$.pipe(switchMap((c) => c.GetAccountByID(id)));
    }
}
