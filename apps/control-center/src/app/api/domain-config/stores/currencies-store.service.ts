import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { Repository, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { Observable, catchError, map, of, retry, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrenciesStoreService {
    private repositoryService = inject(Repository);
    private log = inject(NotifyLogService);

    currencies = computed(() => this.currencyObjects.value().map((v) => v.object.currency.data));
    isLoading = computed(() => this.currencyObjects.isLoading());

    private currencyObjects = rxResource({
        defaultValue: [],
        stream: () =>
            this.getAllCurrencies().pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'currencies');
                    return of<VersionedObject[]>([]);
                }),
            ),
    });

    private getAllCurrencies(continuationToken?: string): Observable<VersionedObject[]> {
        return this.repositoryService
            .SearchFullObjects({
                type: 2 satisfies DomainObjectType.currency,
                query: '*',
                limit: 1_000_000,
                continuation_token: continuationToken,
            })
            .pipe(
                retry(1),
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
