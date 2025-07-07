import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, from, of } from 'rxjs';
import { map, mergeScan, mergeWith, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { Async, PossiblyAsync, getPossiblyAsyncObservable } from './async';

interface Options<T, P = void, R = T> {
    loader: (params: P, prev: T) => Async<T>;
    map?: (value: T) => PossiblyAsync<R>;
    params?: () => Async<P>;
    seed?: T;
}

export function observableResource<T, P = void>(options: Options<T, P>) {
    const dr = inject(DestroyRef);

    const params$ = options.params ? from(options.params()) : of(undefined as P);
    const mapFn = options.map ?? ((v) => v);

    const reload$ = new Subject<void>();
    const set$ = new Subject<T>();

    const value$ = params$.pipe(
        switchMap((p) =>
            reload$.pipe(
                map(() => p),
                startWith(p),
            ),
        ),
        mergeScan((acc, p) => options.loader(p, acc), options.seed as T, 1),
        switchMap((v) => getPossiblyAsyncObservable(mapFn(v))),
        mergeWith(set$),
        takeUntilDestroyed(dr),
        shareReplay(1),
    );

    return {
        value$,
        value: toSignal(value$),
        reload: () => {
            reload$.next();
        },
        set: (value: T) => {
            set$.next(value);
        },
    };
}
