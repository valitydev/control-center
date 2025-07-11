import { DestroyRef, Signal, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from './async';
import { progressTo } from './operators';

interface Options<TAccResult, TParams = void, TResult = TAccResult> {
    loader: (params: TParams, acc: TAccResult) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
    initParams?: TParams;
}

export type ObservableResource<TResult, TParams = void> = {
    value$: Observable<TResult>;
    value: Signal<TResult | undefined>;
    reload: () => void;

    params$: Observable<TParams>;
    params: Signal<TParams | undefined>;
    setParams: (params: TParams) => void;
    updateParams: (fn: (prevParams: TParams) => TParams) => void;

    isLoading$: Observable<boolean>;
    isLoading: Signal<boolean | undefined>;

    next: (res: TResult) => void;
};

export function observableResource<TAccResult, TParams = void, TResult = TAccResult>(
    options: Options<TAccResult, TParams, TResult>,
): ObservableResource<TResult, TParams> {
    const dr = inject(DestroyRef);

    let params: TParams = options.initParams as TParams;
    const params$ = new ReplaySubject<TParams>(1);
    if ('initParams' in options) {
        params$.next(options.initParams as TParams);
    }

    const mapFn = options.map ?? ((v: TAccResult) => v as never as TResult);
    const reload$ = new Subject<void>();
    const progress$ = new BehaviorSubject(0);
    const isLoading$ = progress$.pipe(map(Boolean));
    const res$ = new Subject<TResult>();

    const value$ = params$.pipe(
        switchMap((p) =>
            reload$.pipe(
                map(() => p),
                startWith(p),
            ),
        ),
        mergeScan(
            (acc, params) => options.loader(params, acc).pipe(progressTo(progress$)),
            options.seed as TAccResult,
            1,
        ),
        switchMap((v) => getPossiblyAsyncObservable(mapFn(v))),
        mergeWith(res$),
        takeUntilDestroyed(dr),
        shareReplay(1),
    );

    return {
        value$,
        value: toSignal(value$),

        params$: params$,
        params: toSignal(params$),

        reload: () => {
            reload$.next();
        },
        setParams: (p) => {
            params = p;
            params$.next(params);
        },
        updateParams: (fn) => {
            params = fn(params);
            params$.next(params);
        },

        isLoading$,
        isLoading: toSignal(isLoading$),

        next: (res) => {
            res$.next(res);
        },
    };
}

export function mapObservableResource<TResult, TParams, TNewResult>(
    resource: ObservableResource<TResult, TParams>,
    mapFn: (value: TResult) => PossiblyAsync<TNewResult>,
): ObservableResource<TNewResult, TParams> {
    const dr = inject(DestroyRef);

    const res$ = new Subject<TNewResult>();
    // TODO: use internal value$ without shareReplay
    const value$ = resource.value$.pipe(
        switchMap((v) => getPossiblyAsyncObservable(mapFn(v))),
        mergeWith(res$),
        takeUntilDestroyed(dr),
        shareReplay(1),
    );

    return {
        ...resource,
        value$,
        value: toSignal(value$),
        next: (res) => {
            res$.next(res);
        },
    };
}
