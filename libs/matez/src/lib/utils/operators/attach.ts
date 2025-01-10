import { EMPTY, MonoTypeOperatorFunction, Observable, merge, mergeMap } from 'rxjs';

import { ObservableOrFn, getObservable } from './get-observable';

export function attach<T>(attached: ObservableOrFn<T>, main: ObservableOrFn): Observable<T> {
    return merge(getObservable(attached), getObservable(main).pipe(mergeMap(() => EMPTY)));
}

export function attachTo<T>(main: ObservableOrFn): MonoTypeOperatorFunction<T> {
    return (src$) => attach(src$, main);
}
