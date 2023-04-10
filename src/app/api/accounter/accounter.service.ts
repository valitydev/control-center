import { Injectable } from '@angular/core';
import {
    accounter_AccounterCodegenClient,
    ThriftAstMetadata,
    accounter_Accounter,
} from '@vality/domain-proto';
import { Account } from '@vality/domain-proto/internal/accounter';
import { AccountID } from '@vality/domain-proto/internal/domain';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class AccounterService {
    private client$: Observable<accounter_AccounterCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('Accounter'))
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                accounter_Accounter({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetAccountByID(id: AccountID): Observable<Account> {
        return this.client$.pipe(switchMap((c) => c.GetAccountByID(id)));
    }
}
