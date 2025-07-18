import { DestroyRef, Injector, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    BehaviorSubject,
    Observable,
    OperatorFunction,
    ReplaySubject,
    Subject,
    combineLatest,
    from,
    merge,
} from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, skipWhile, switchMap, take } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable, isAsync } from './async';
import { progressTo } from './operators';

enum ObservableResourceActionType {
    load,
    set,
}

interface ObservableResourceAction {
    type: ObservableResourceActionType;
}

interface ObservableResourceActionWithParams<TParams> extends ObservableResourceAction {
    params: TParams;
}

interface ObservableResourceOptions<TAccResult, TParams = void, TResult = TAccResult> {
    loader: (
        params: TParams,
        acc: TAccResult,
        action: ObservableResourceAction,
    ) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
    params?: PossiblyAsync<TParams>;
}

export class ObservableResource<TAccResult, TParams = void, TResult = TAccResult> {
    protected dr = inject(DestroyRef);
    protected injector = inject(Injector);

    protected mergedValue$ = new Subject<TResult>();
    protected mergedParams$ = isAsync(this.options.params)
        ? new ReplaySubject<TParams>(1)
        : new BehaviorSubject<TParams>(this.options.params as TParams);
    protected actionParams$ = this.createActionParams();
    protected progress$ = new BehaviorSubject<number>(0);

    params$ = this.actionParams$.pipe(map(({ params }) => params));
    params = toSignal(this.params$);

    value$ = this.createValue();
    value = toSignal(this.value$);

    isLoading$ = this.progress$.pipe(map(Boolean));
    protected _isLoading = toSignal(this.isLoading$);
    isLoading = computed(() => this._isLoading() || false);

    constructor(protected options: ObservableResourceOptions<TAccResult, TParams, TResult>) {}

    protected createActionParams(): Observable<ObservableResourceActionWithParams<TParams>> {
        const mergedParamsAction$ = this.mergedParams$.pipe(
            map((params) => ({ type: ObservableResourceActionType.set, params })),
        );
        return isAsync(this.options.params)
            ? merge(
                  from(this.options.params).pipe(
                      map((params) => ({ type: ObservableResourceActionType.load, params })),
                  ),
                  mergedParamsAction$,
              ).pipe(takeUntilDestroyed(this.dr), shareReplay(1))
            : mergedParamsAction$;
    }

    protected createValue() {
        return this.actionParams$.pipe(
            mergeScan(
                (acc, { params, ...action }) =>
                    this.options.loader(params, acc, action).pipe(progressTo(this.progress$)),
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
        if (typeof paramsOrParamsFn === 'function') {
            (paramsOrParamsFn as (prevParams: TParams) => TParams)(this.params() as TParams);
        }
        this.mergedParams$.next(paramsOrParamsFn as TParams);
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
