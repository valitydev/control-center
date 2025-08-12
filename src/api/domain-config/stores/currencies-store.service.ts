import { catchError, map, of } from 'rxjs';

import { Injectable, inject } from '@angular/core';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, fetchAll, observableResource } from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

@Injectable({ providedIn: 'root' })
export class CurrenciesStoreService {
    private repositoryService = inject(ThriftRepositoryService);
    private log = inject(NotifyLogService);

    resource = observableResource({
        loader: () =>
            fetchAll((continuationToken) =>
                this.repositoryService.SearchFullObjects({
                    type: DomainObjectType.currency,
                    query: '*',
                    limit: 1_000_000,
                    continuation_token: continuationToken,
                }),
            ).pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'currencies');
                    return of<VersionedObject[]>([]);
                }),
            ),
    });

    currencies$ = this.resource.value$.pipe(
        map((objs) => objs.map((obj) => obj.object.currency.data)),
    );

    isLoading$ = this.resource.isLoading$;
}
