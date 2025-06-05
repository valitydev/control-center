import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { Observable, catchError, map, of, retry, switchMap } from 'rxjs';

import { Repository2Service } from '../repository2.service';

@Injectable({ providedIn: 'root' })
export class CurrenciesStoreService {
    currencies = rxResource({
        loader: () =>
            this.getAllCurrencies().pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'currencies');
                    return of<VersionedObject[]>([]);
                }),
            ),
    });

    constructor(
        private repositoryService: Repository2Service,
        private log: NotifyLogService,
    ) {}

    private getAllCurrencies(continuationToken = undefined): Observable<VersionedObject[]> {
        return this.repositoryService
            .SearchFullObjects({
                type: 2 satisfies DomainObjectType.currency,
                query: '*',
                limit: 1_000_000,
                continuation_token: continuationToken,
            })
            .pipe(
                retry(2),
                switchMap((resp) => {
                    if (resp.continuation_token) {
                        return this.getAllCurrencies(resp.continuation_token).pipe(
                            map((nextCurrencies) => [...resp.result, ...nextCurrencies]),
                        );
                    }
                    return of(resp.result);
                }),
            );
    }
}
