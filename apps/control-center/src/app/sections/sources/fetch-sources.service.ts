import { Injectable } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import { compareDifferentTypes, NotifyLogService, progressTo } from '@vality/matez';
import { Observable, switchMap, of, BehaviorSubject } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators';

import { createDsl } from '../../api/fistful-stat';
import { FistfulStatisticsService } from '../../api/fistful-stat/fistful-statistics.service';

@Injectable({
    providedIn: 'root',
})
export class FetchSourcesService {
    sources$: Observable<StatSource[]> = this.fetch().pipe(
        map((s) =>
            s.sort(
                (a, b) =>
                    compareDifferentTypes(a.name, b.name) ||
                    +new Date(a.created_at) - +new Date(b.created_at),
            ),
        ),
        progressTo(() => this.progress$),
        shareReplay(1),
    );
    progress$ = new BehaviorSubject(0);

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private log: NotifyLogService,
    ) {}

    private fetch(
        sources: StatSource[] = [],
        continuationToken?: string,
    ): Observable<StatSource[]> {
        return this.fistfulStatisticsService
            .GetSources({
                dsl: createDsl({ sources: {} }),
                ...(continuationToken ? { continuation_token: continuationToken } : {}),
            })
            .pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of(null);
                }),
                switchMap((res) =>
                    res
                        ? res.continuation_token
                            ? this.fetch([...sources, ...res.data.sources], res.continuation_token)
                            : of([...sources, ...res.data.sources])
                        : of(sources),
                ),
            );
    }
}
