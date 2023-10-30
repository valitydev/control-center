import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    pluck,
    share,
    shareReplay,
    startWith,
    switchMap,
    tap,
} from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { FetchAction } from './fetch-action';
import { FetchFn } from './fetch-fn';
import { FetchResult } from './fetch-result';
import { scanAction, scanFetchResult } from './operators';
import { SHARE_REPLAY_CONF } from './utils/share-replay-conf';

// TODO: make free of subscription & UntilDestroy
// TODO: share public props together
// TODO: make fetcher injectable
/**
 * @deprecated
 */
@UntilDestroy()
export abstract class PartialFetcher<R, P> {
    readonly fetchResultChanges$: Observable<{
        result: R[];
        hasMore: boolean;
        continuationToken: string;
    }>;

    readonly searchResult$: Observable<R[]>;
    readonly hasMore$: Observable<boolean>;
    readonly doAction$: Observable<boolean>;
    readonly doSearchAction$: Observable<boolean>;
    readonly errors$: Observable<unknown>;

    private action$ = new Subject<FetchAction<P>>();

    // TODO: make a dependency for DI
    constructor(
        debounceActionTime: number = 300,
        private size = 25,
    ) {
        const actionWithParams$ = this.getActionWithParams(debounceActionTime);
        const fetchResult$ = this.getFetchResult(actionWithParams$);

        this.fetchResultChanges$ = fetchResult$.pipe(
            map(({ result, continuationToken }) => ({
                result: result ?? [],
                continuationToken,
                hasMore: !!continuationToken,
            })),
            share(),
        );
        this.searchResult$ = this.fetchResultChanges$.pipe(
            pluck('result'),
            shareReplay(SHARE_REPLAY_CONF),
        );

        this.hasMore$ = this.fetchResultChanges$.pipe(
            pluck('hasMore'),
            startWith(null as boolean),
            distinctUntilChanged(),
            shareReplay(SHARE_REPLAY_CONF),
        );

        this.doAction$ = progress(actionWithParams$, fetchResult$, false).pipe(
            shareReplay(SHARE_REPLAY_CONF),
        );
        this.doSearchAction$ = progress(
            actionWithParams$.pipe(filter(({ type }) => type === 'search')),
            fetchResult$,
            true,
        ).pipe(shareReplay(SHARE_REPLAY_CONF));
        this.errors$ = fetchResult$.pipe(
            switchMap(({ error }) => (error ? of(error) : EMPTY)),
            tap((error) => this.handleError(error)),
            share(),
        );

        merge(
            this.searchResult$,
            this.hasMore$,
            this.doAction$,
            this.doSearchAction$,
            this.errors$,
            this.fetchResultChanges$,
        )
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    search(value: P, size?: number) {
        this.action$.next({ type: 'search', value, size });
    }

    refresh(size?: number) {
        this.action$.next({ type: 'search', size });
    }

    fetchMore() {
        this.action$.next({ type: 'fetchMore' });
    }

    protected handleError(error: unknown): void {
        console.error('Partial fetcher error: ', error);
    }

    protected abstract fetch(...args: Parameters<FetchFn<P, R>>): ReturnType<FetchFn<P, R>>;

    private getActionWithParams(debounceActionTime: number): Observable<FetchAction<P>> {
        return this.action$.pipe(
            scanAction,
            debounceActionTime ? debounceTime(debounceActionTime) : tap(),
            share(),
        );
    }

    private getFetchResult(
        actionWithParams$: Observable<FetchAction<P>>,
    ): Observable<FetchResult<R>> {
        const fetchFn = this.fetch.bind(this) as FetchFn<P, R>;
        return actionWithParams$.pipe(
            scanFetchResult(fetchFn, this.size),
            shareReplay(SHARE_REPLAY_CONF),
        );
    }
}
