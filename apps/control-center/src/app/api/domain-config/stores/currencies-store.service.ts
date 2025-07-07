import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { Observable, catchError, map, of, retry, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Repository2Service } from '../repository2.service';

import { DomainStoreService } from './domain-store.service';

@Injectable({ providedIn: 'root' })
export class CurrenciesStoreService {
    private repositoryService = inject(Repository2Service);
    private log = inject(NotifyLogService);
    private domainStoreService = inject(DomainStoreService);
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

    private getAllCurrencies(continuationToken = undefined): Observable<VersionedObject[]> {
        return environment.domain2
            ? this.repositoryService
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
                  )
            : this.domainStoreService.getObjects('currency').pipe(
                  map((currencies) =>
                      currencies
                          ? currencies.map((c) => ({
                                info: {
                                    version: 0,
                                    changed_at: '',
                                    changed_by: {
                                        id: '',
                                        email: '',
                                        name: '',
                                    },
                                },
                                object: { currency: c },
                            }))
                          : [],
                  ),
              );
    }
}
