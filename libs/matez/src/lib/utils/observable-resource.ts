import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, from, of } from 'rxjs';
import { map, mergeWith, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { Async } from './async';

interface Options<T, P = void> {
    loader: (params: P) => Async<T>;
    params?: () => Async<P>;
}

export function observableResource<T, P = void>({ loader, params }: Options<T, P>) {
    const dr = inject(DestroyRef);

    const params$ = params ? from(params()) : of(undefined as P);

    const reload$ = new Subject<void>();
    const set$ = new Subject<T>();

    const value$ = params$.pipe(
        switchMap((p) =>
            reload$.pipe(
                map(() => p),
                startWith(p),
            ),
        ),
        switchMap((p) => loader(p)),
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
