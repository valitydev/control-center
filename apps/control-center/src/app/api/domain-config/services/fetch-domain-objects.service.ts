import { Injectable, inject } from '@angular/core';
import { LimitedVersionedObject, SearchRequestParams } from '@vality/domain-proto/domain_config_v2';
import { FetchOptions, FetchSuperclass, NotifyLogService, clean } from '@vality/matez';
import { catchError, map, of } from 'rxjs';

import { Repository2Service } from '../repository2.service';

type FetchParams = Partial<Omit<SearchRequestParams, 'continuation_token' | 'limit'>>;

@Injectable()
export class FetchDomainObjectsService extends FetchSuperclass<
    LimitedVersionedObject,
    FetchParams
> {
    private repositoryService = inject(Repository2Service);
    private log = inject(NotifyLogService);

    constructor() {
        super();
    }

    fetch(params: FetchParams, options: FetchOptions) {
        return this.repositoryService
            .SearchObjects(
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
