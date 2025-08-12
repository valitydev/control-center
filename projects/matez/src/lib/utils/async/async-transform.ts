import { Observable, ReplaySubject, combineLatest, defer, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Injectable, OnDestroy, inject } from '@angular/core';

import { getPossiblyAsyncObservable } from './get-possibly-async-observable';
import { PossiblyAsync } from './is-async';

export type AsyncTransformParameters<TValue = unknown, TParams extends unknown[] = []> = [
    PossiblyAsync<TValue>,
    ...TParams,
];

@Injectable()
export abstract class AsyncTransform<
    TValue = unknown,
    TParams extends unknown[] = [],
    TResult = string | null,
> implements OnDestroy
{
    protected abstract result$: Observable<TResult>;

    protected params$: Observable<[TValue, ...TParams]> = defer(() => this.args$).pipe(
        switchMap((args) =>
            combineLatest([
                getPossiblyAsyncObservable(args[0] as TValue),
                of(args.slice(1) as TParams),
            ]),
        ),
        map(([value, params]) => [value, ...params] as [TValue, ...TParams]),
    );

    private cdr = inject(ChangeDetectorRef);
    private asyncPipe = new AsyncPipe(this.cdr);
    private args$ = new ReplaySubject<[PossiblyAsync<TValue>, ...TParams]>(1);

    ngOnDestroy() {
        this.asyncPipe.ngOnDestroy();
    }

    protected asyncTransform(args: AsyncTransformParameters<TValue, TParams>): TResult | null {
        this.args$.next(args);
        return this.asyncPipe.transform(this.result$);
    }
}
