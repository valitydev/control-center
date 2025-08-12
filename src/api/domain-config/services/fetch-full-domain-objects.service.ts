import { catchError, map, of } from 'rxjs';

import { Injectable, inject } from '@angular/core';

import { SearchRequestParams, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { FetchOptions, FetchSuperclass, NotifyLogService, clean } from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

type FetchParams = Partial<Omit<SearchRequestParams, 'continuation_token' | 'limit'>>;

@Injectable()
export class FetchFullDomainObjectsService extends FetchSuperclass<VersionedObject, FetchParams> {
    private repositoryService = inject(ThriftRepositoryService);
    private log = inject(NotifyLogService);

    fetch(params: FetchParams, options: FetchOptions) {
        return this.repositoryService
            .SearchFullObjects(
                clean({
                    ...params,
                    query: params.query || '*',
                    limit: options.size,
                    continuation_token: options.continuationToken,
                }),
            )
            .pipe(
                map((res) => ({
                    result: res.result,
                    continuationToken: res.continuation_token,
                })),
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'domain objects');
                    return of({ result: [] });
                }),
            );
    }
}
