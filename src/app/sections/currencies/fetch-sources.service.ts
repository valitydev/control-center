import { Injectable } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import { map } from 'rxjs/operators';

import { FistfulStatisticsService, createDsl } from '../../api/fistful-stat';
import { PartialFetcher } from '../../shared/services';

@Injectable({
    providedIn: 'root',
})
export class FetchSourcesService extends PartialFetcher<StatSource, object> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    fetch(params: object, continuationToken: string) {
        return this.fistfulStatisticsService
            .GetSources({
                dsl: createDsl({ sources: params }),
                continuation_token: continuationToken,
            })
            .pipe(
                map((res) => ({
                    result: res.data.sources,
                    continuationToken: res.continuation_token,
                }))
            );
    }
}
