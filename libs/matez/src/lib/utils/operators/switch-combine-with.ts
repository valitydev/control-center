import { switchMap, combineLatest, of, Observable } from 'rxjs';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../async';

export type ProjectInputs<R extends readonly unknown[]> = {
    [K in keyof R]: PossiblyAsync<R[K]>;
};

export function switchCombineWith<T, R extends readonly unknown[]>(
    project: (value: T, index: number) => readonly [...ProjectInputs<R>],
) {
    return (src$: Observable<T>) =>
        src$.pipe(
            switchMap((value, index) => {
                const res = project(value, index);
                return combineLatest([
                    of(value),
                    ...(Array.isArray(res) ? res : [res]).map((r) => getPossiblyAsyncObservable(r)),
                ]);
            }),
        ) as Observable<[T, ...R]>;
}
