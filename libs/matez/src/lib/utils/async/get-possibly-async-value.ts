import { Observable, of } from 'rxjs';

import { getPossiblyAsyncObservable } from './get-possibly-async-observable';
import { PossiblyAsyncFn, PossiblyAsyncValue } from './types/possibly-async-value';

export function getPossiblyAsyncValue<T, P extends unknown[] = [], D = undefined>(
    getValue: PossiblyAsyncValue<T, P> | D,
    args: P = [] as never as P,
    defaultValue: T = undefined as T,
    isDefaultValue: (v: T | D) => boolean = ((v: T | D) => v === undefined) as (
        v: T | D,
    ) => boolean,
): Observable<T> {
    if (isDefaultValue(getValue as D)) {
        return of(defaultValue as T);
    }
    if (typeof getValue === 'function') {
        return getPossiblyAsyncObservable((getValue as PossiblyAsyncFn<T, P>)(...args));
    }
    return getPossiblyAsyncObservable(getValue) as never as Observable<T>;
}
