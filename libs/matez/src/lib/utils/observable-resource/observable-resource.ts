import { DestroyRef, Injector, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    BehaviorSubject,
    Observable,
    OperatorFunction,
    ReplaySubject,
    Subject,
    combineLatest,
    merge,
} from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, skipWhile, switchMap, take } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../async';
import { progressTo } from '../operators';

export abstract class ObservableResourceBaseAction<TParams> {
    constructor(public params: TParams) {}
}

export class ObservableResourceLoadAction<TParams> extends ObservableResourceBaseAction<TParams> {}
export class ObservableResourceSetAction<TParams> extends ObservableResourceBaseAction<TParams> {}

export interface ObservableResourceOptions<TAccResult, TParams = void, TResult = TAccResult> {
    loader: (
        params: TParams,
        acc: TAccResult,
        action: ObservableResourceBaseAction<TParams>,
    ) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
    params?: PossiblyAsync<TParams>;
}

export class ObservableResource<TAccResult, TParams = void, TResult = TAccResult> {
    protected dr = inject(DestroyRef);
    protected injector = inject(Injector);

    protected mergedAction$ = new ReplaySubject<ObservableResourceBaseAction<TParams>>(1);
    protected action$ = merge(
        getPossiblyAsyncObservable(this.options.params).pipe(
            map((params) => new ObservableResourceLoadAction(params as TParams)),
        ),
        this.mergedAction$,
    ).pipe(takeUntilDestroyed(this.dr), shareReplay(1));
    params$ = this.action$.pipe(map(({ params }) => params));
    params = toSignal(this.params$);

    protected mergedValue$ = new Subject<TResult>();
    value$ = this.createValue();
    value = toSignal(this.value$);

    protected progress$ = new BehaviorSubject<number>(0);
    isLoading$ = this.progress$.pipe(map(Boolean));
    isLoading = toSignal(this.isLoading$, { initialValue: false });

    constructor(protected options: ObservableResourceOptions<TAccResult, TParams, TResult>) {}

    protected createValue() {
        return this.action$.pipe(
            mergeScan(
                (acc, action) =>
                    this.options
                        .loader(action.params, acc, action)
                        .pipe(progressTo(this.progress$)),
                this.options.seed as TAccResult,
                1,
            ),
            ...((this.options.map
                ? [
                      switchMap((v) =>
                          getPossiblyAsyncObservable(
                              (
                                  this.options.map as NonNullable<
                                      ObservableResourceOptions<TAccResult, TParams, TResult>['map']
                                  >
                              )(v),
                          ),
                      ),
                  ]
                : []) as [OperatorFunction<TAccResult, TResult>]),
            mergeWith(this.mergedValue$),
            takeUntilDestroyed(this.dr),
            shareReplay(1),
        );
    }

    set(value: TResult) {
        this.mergedValue$.next(value);
    }

    getFirstValue(): Observable<TResult> {
        return combineLatest([this.value$, this.isLoading$]).pipe(
            skipWhile(([_, isLoading]) => isLoading),
            map(([value]) => value),
            take(1),
        );
    }

    setParams(paramsOrParamsFn: TParams | ((prevParams: TParams) => TParams)) {
        const newParams =
            typeof paramsOrParamsFn === 'function'
                ? (paramsOrParamsFn as (prevParams: TParams) => TParams)(this.params() as TParams)
                : (paramsOrParamsFn as TParams);
        this.mergedAction$.next(new ObservableResourceSetAction(newParams));
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
    options: ObservableResourceOptions<TAccResult, TParams, TResult>,
) {
    return new ObservableResource<TAccResult, TParams, TResult>(options);
}
