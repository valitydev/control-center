import autoBind from 'auto-bind';
import { BehaviorSubject, EMPTY, Observable, Subject, combineLatest, merge, of } from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, skipWhile, switchMap, take } from 'rxjs/operators';

import { DestroyRef, Injector, Signal, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../async';
import { filterOperator, progressTo } from '../operators';

export type ObservableResourceActionType = string;

const PARAMS_ACTION = 'params' satisfies ObservableResourceActionType;

export type ObservableResourceActions = typeof PARAMS_ACTION;

export type ObservableResourceOptions<
    TAccResult,
    TParams = void,
    TResult = TAccResult,
    TAction = ObservableResourceActionType,
> = {
    loader: (params: TParams, acc: TAccResult, action: TAction) => Observable<TAccResult>;
    map?: (value: TAccResult) => PossiblyAsync<TResult>;
    seed?: TAccResult;
} & (TParams extends undefined | void
    ? {
          params?: PossiblyAsync<TParams>;
      }
    : {
          params: PossiblyAsync<TParams>;
      });

export class ObservableResource<
    TAccResult,
    TParams = void,
    TResult = TAccResult,
    TAction = ObservableResourceActionType,
> {
    protected internalOptions!: ObservableResourceOptions<TAccResult, TParams, TResult, TAction>;

    protected dr = inject(DestroyRef);
    protected injector = inject(Injector);

    protected progress$ = new BehaviorSubject<number>(0);
    isLoading$ = this.progress$.pipe(map(Boolean));
    isLoading = toSignal(this.isLoading$, { initialValue: false });

    protected action$ = new Subject<TAction>();
    protected mergedParams$ = new Subject<TParams>();
    params$!: Observable<TParams>;
    params!: Signal<TParams | undefined>;

    protected accValue$!: Observable<TAccResult>;
    protected mergedValue$ = new Subject<TResult>();
    value$!: Observable<TResult>;
    value!: Signal<TResult | undefined>;

    constructor(options?: ObservableResourceOptions<TAccResult, TParams, TResult, TAction>) {
        if (options) this.init(options);
    }

    protected init(options: ObservableResourceOptions<TAccResult, TParams, TResult, TAction>) {
        // needed for map method
        autoBind(this);

        this.internalOptions = options;

        this.params$ = this.createParams().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
        this.params = toSignal(this.params$);

        this.accValue$ = this.createAccValue().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
        this.value$ = this.createValue().pipe(takeUntilDestroyed(this.dr), shareReplay(1));
        this.value = toSignal(this.value$);
    }

    protected createParams() {
        return merge(
            getPossiblyAsyncObservable<TParams>(this.internalOptions.params),
            this.mergedParams$,
        );
    }

    protected createAccValue() {
        return merge(
            this.params$.pipe(map((params) => ({ action: PARAMS_ACTION, params }))),
            this.action$.pipe(map((action) => ({ action }))),
        ).pipe(
            mergeScan<
                { action: TAction; params?: TParams },
                { accResult: TAccResult; params?: TParams }
            >(
                (acc, actionParams) => {
                    const params =
                        actionParams.action === PARAMS_ACTION ? actionParams.params : acc.params;
                    return this.internalOptions
                        .loader(params, acc.accResult, actionParams.action)
                        .pipe(
                            map((accResult) => ({ accResult, params })),
                            progressTo(this.progress$),
                        );
                },
                { accResult: this.internalOptions.seed },
                1,
            ),
            map(({ accResult }) => accResult),
        );
    }

    protected createValue() {
        const mapFn = this.internalOptions.map;
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

    protected action(action: TAction) {
        this.action$.next(action);
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

export function observableResource<
    TAccResult,
    TParams = void,
    TResult = TAccResult,
    TAction = ObservableResourceActionType,
>(options: ObservableResourceOptions<TAccResult, TParams, TResult, TAction>) {
    return new ObservableResource<TAccResult, TParams, TResult, TAction>(options);
}
