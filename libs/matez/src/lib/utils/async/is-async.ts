import { isObservable, Observable } from 'rxjs';
import { isPromise } from 'rxjs/internal/util/isPromise';

export type Async<T> = Observable<T> | Promise<T>;
export type PossiblyAsync<T> = Async<T> | T;

export function isAsync<T>(value: PossiblyAsync<T>): value is Async<T> {
    return isObservable(value) || isPromise(value);
}
