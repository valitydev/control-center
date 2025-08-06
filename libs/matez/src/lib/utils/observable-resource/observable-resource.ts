import { DestroyRef, Injector, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import autoBind from 'auto-bind';
import { BehaviorSubject, Observable, Subject, combineLatest, merge } from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, skipWhile, switchMap, take } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../async';
import { filterOperator, progressTo } from '../operators';

export class ObservableResourceAction {
    constructor(public readonly type: string) {}
}

const INIT_ACTION = new ObservableResourceAction('init');

export interface ObservableResourceOptions<TAccResult, TParams = void, TResult = TAccResult> {
    loader: (params: TParams, acc: TAccResult) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
    params?: PossiblyAsync<TParams>;
}

export class ObservableResource<TAccResult, TParams = void, TResult = TAccResult> {
    protected dr = inject(DestroyRef);
    protected injector = inject(Injector);

    protected progress$ = new BehaviorSubject<number>(0);
    isLoading$ = this.progress$.pipe(map(Boolean));
    isLoading = toSignal(this.isLoading$, { initialValue: false });

    protected action$ = new BehaviorSubject<ObservableResourceAction>(INIT_ACTION);
    protected mergedParams$ = new Subject<TParams>();
    params$ = this.createParams().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
    params = toSignal(this.params$);

    protected accValue$ = this.createAccValue().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
    protected mergedValue$ = new Subject<TResult>();
    value$ = this.createValue().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
    value = toSignal(this.value$);

    constructor(protected options: ObservableResourceOptions<TAccResult, TParams, TResult>) {
        // need for map method
        autoBind(this);
    }

    protected createParams() {
        return merge(
            getPossiblyAsyncObservable<TParams>(this.options.params as never),
            this.mergedParams$,
        );
    }

    protected createAccValue() {
        return combineLatest([this.params$, this.action$]).pipe(
            mergeScan(
                (acc, [params]) =>
                    this.options.loader(params as TParams, acc).pipe(progressTo(this.progress$)),
                this.options.seed as TAccResult,
                1,
            ),
        );
    }

    protected createValue() {
        const mapFn = this.options.map;
        return this.accValue$.pipe(
            ...filterOperator(
                mapFn && switchMap((v: TAccResult) => getPossiblyAsyncObservable(mapFn(v))),
            ),
            mergeWith(this.mergedValue$),
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
        this.mergedParams$.next(newParams);
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

        return Object.assign({}, this, {
            value$,
            value: toSignal(value$, { injector: this.injector }),
            map: (fn: (value: TResult) => PossiblyAsync<TNewResult>) =>
                this.map(fn, value$ as never),
        }) as never;
    }
}

export function observableResource<TAccResult, TParams = void, TResult = TAccResult>(
    options: ObservableResourceOptions<TAccResult, TParams, TResult>,
) {
    return new ObservableResource<TAccResult, TParams, TResult>(options);
}
