import { Injectable } from '@angular/core';
import { LimitedVersionedObject, SearchRequestParams } from '@vality/domain-proto/domain_config_v2';
import { FetchOptions, FetchSuperclass, clean } from '@vality/matez';
import { map, switchMap } from 'rxjs';

import { Repository2Service } from '../repository2.service';

type FetchParams = Partial<Pick<SearchRequestParams, 'query' | 'type'>>;

@Injectable({
    providedIn: 'root',
})
export class FetchDomainObjectsService extends FetchSuperclass<
    LimitedVersionedObject,
    FetchParams
> {
    constructor(private repositoryService: Repository2Service) {
        super();
    }

    fetch(params: FetchParams, options: FetchOptions) {
        return this.repositoryService.GetLatestVersion().pipe(
            switchMap((version) =>
                this.repositoryService.SearchObjects(
                    clean({
                        query: params.query || '*',
                        type: params.type,
                        limit: options.size,
                        continuation_token: options.continuationToken,
                        version,
                    }),
                ),
            ),
            map((res) => ({
                result: res.result,
                continuationToken: res.continuation_token,
            })),
        );
    }
}
