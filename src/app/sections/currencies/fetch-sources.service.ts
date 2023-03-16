import { Injectable } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import { Observable, switchMap, of, BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { progressTo } from '../../../utils';
import { FistfulStatisticsService, createDsl } from '../../api/fistful-stat';

@Injectable({
    providedIn: 'root',
})
export class FetchSourcesService {
    sources$: Observable<StatSource[]> = this.fetch().pipe(
        progressTo(() => this.progress$),
        shareReplay(1)
    );
    progress$ = new BehaviorSubject(0);

    constructor(private fistfulStatisticsService: FistfulStatisticsService) {}

    private fetch(
        sources: StatSource[] = [],
        continuationToken?: string
    ): Observable<StatSource[]> {
        return this.fistfulStatisticsService
            .GetSources({
                dsl: createDsl({ sources: {} }),
                ...(continuationToken ? { continuation_token: continuationToken } : {}),
            })
            .pipe(
                switchMap((res) =>
                    res.continuation_token
                        ? this.fetch([...sources, ...res.data.sources], res.continuation_token)
                        : of([...sources, ...res.data.sources])
                )
            );
    }
}
