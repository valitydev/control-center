import { Observable, concat, of, switchMap, timer } from 'rxjs';

export function asyncStartWith<V = never>(value?: V, timerMs = 0) {
    return <T>(src$: Observable<T>): Observable<T | V> =>
        concat(...((value ? [of(value)] : []) as []), timer(timerMs).pipe(switchMap(() => src$)));
}
