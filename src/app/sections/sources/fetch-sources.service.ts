import { Injectable } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import { Observable, switchMap, of, BehaviorSubject } from 'rxjs';
import { shareReplay, map, catchError } from 'rxjs/operators';

import { FistfulStatisticsService, createDsl } from '@cc/app/api/fistful-stat';
import { progressTo } from '@cc/utils';

import { NotificationErrorService } from '../../shared/services/notification-error';

@Injectable({
    providedIn: 'root',
})
export class FetchSourcesService {
    sources$: Observable<StatSource[]> = this.fetch().pipe(
        map((s) => s.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))),
        progressTo(() => this.progress$),
        shareReplay(1),
    );
    progress$ = new BehaviorSubject(0);

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private errorService: NotificationErrorService,
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
                    this.errorService.error(err);
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
