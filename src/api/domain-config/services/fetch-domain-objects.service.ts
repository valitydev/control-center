import { catchError, map, of } from 'rxjs';

import { Injectable, inject } from '@angular/core';

import { LimitedVersionedObject, SearchRequestParams } from '@vality/domain-proto/domain_config_v2';
import {
    NotifyLogService,
    PagedObservableResourceLoaderOptions,
    PagedObservableResourceSuperclass,
    clean,
} from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

type FetchParams = Partial<Omit<SearchRequestParams, 'continuation_token' | 'limit'>>;

@Injectable()
export class FetchDomainObjectsService extends PagedObservableResourceSuperclass<
    LimitedVersionedObject,
    FetchParams
> {
    private repositoryService = inject(ThriftRepositoryService);
    private log = inject(NotifyLogService);

    loader(params: FetchParams, options: PagedObservableResourceLoaderOptions) {
        return this.repositoryService
            .SearchObjects(
                clean({
                    ...params,
                    query: params.query || '*',
                    limit: options.size,
                    continuation_token: options.continuationToken,
                    version: params.version === -1 ? undefined : params.version,
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
