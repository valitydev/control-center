import { DestroyRef, Injector, Signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, OperatorFunction, ReplaySubject, Subject } from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, switchMap } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from './async';
import { progressTo } from './operators';

interface Options<TAccResult, TParams = void, TResult = TAccResult> {
    loader: (params: TParams, acc: TAccResult) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
    initParams?: TParams;
}

export class ObservableResource<TAccResult, TParams = void, TResult = TAccResult> {
    private dr = inject(DestroyRef);
    private injector = inject(Injector);

    private mergedValue$ = new Subject<TResult>();

    progress$!: BehaviorSubject<number>;

    params$!: ReplaySubject<TParams>;
    params!: Signal<TParams | undefined>;

    value$!: Observable<TResult>;
    value!: Signal<TResult | undefined>;

    isLoading$!: Observable<boolean>;
    isLoading!: Signal<boolean>;

    constructor(options: Options<TAccResult, TParams, TResult>) {
        this.params$ = new ReplaySubject<TParams>(1);
        this.params = toSignal(this.params$);

        this.progress$ = new BehaviorSubject<number>(0);
        this.isLoading$ = this.progress$.pipe(map(Boolean));
        const isLoading = toSignal(this.isLoading$);
        this.isLoading = computed(() => isLoading() || false);

        if ('initParams' in options) {
            this.params$.next(options.initParams as TParams);
        }

        this.value$ = this.params$.pipe(
            mergeScan(
                (acc, p) => options.loader(p, acc).pipe(progressTo(this.progress$)),
                options.seed as TAccResult,
                1,
            ),
            ...((options.map
                ? [
                      switchMap((v) =>
                          getPossiblyAsyncObservable(
                              (options.map as NonNullable<(typeof options)['map']>)(v),
                          ),
                      ),
                  ]
                : []) as [OperatorFunction<TAccResult, TResult>]),
            mergeWith(this.mergedValue$),
            takeUntilDestroyed(this.dr),
            shareReplay(1),
        );
        this.value = toSignal(this.value$);
    }

    setValue(value: TResult) {
        this.mergedValue$.next(value);
    }

    setParams(paramsOrParamsFn: TParams | ((prevParams: TParams) => TParams)) {
        if (typeof paramsOrParamsFn === 'function') {
            (paramsOrParamsFn as (prevParams: TParams) => TParams)(this.params() as TParams);
        }
        this.params$.next(paramsOrParamsFn as TParams);
    }

    reload() {
        this.setParams((p) => p);
    }

    map<TNewResult>(
        mapFn: (value: TResult) => PossiblyAsync<TNewResult>,
        sourceValue$ = this.value$,
    ): ObservableResource<TAccResult, TParams, TNewResult> {
        const value$ = sourceValue$.pipe(
            switchMap((value) => getPossiblyAsyncObservable(mapFn(value))),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );

        return {
            ...this,
            value$,
            value: toSignal(value$, { injector: this.injector }),
            map: (fn: (value: TResult) => PossiblyAsync<TNewResult>) =>
                this.map(fn, value$ as never),
        } as never;
    }
}

export function observableResource<TAccResult, TParams = void, TResult = TAccResult>(
    options: Options<TAccResult, TParams, TResult>,
) {
    return new ObservableResource<TAccResult, TParams, TResult>(options);
}
