import { Observable, defer } from 'rxjs';

export type ObservableOrFn<T = unknown> = (() => Observable<T>) | Observable<T>;

export function getObservable<T>(obsOrFn: ObservableOrFn<T>): Observable<T> {
    return typeof obsOrFn === 'function' ? defer(obsOrFn) : obsOrFn;
}
