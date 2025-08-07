import { Observable, map, of, switchMap } from 'rxjs';

export function fetchAll<T>(
    loadFn: (
        continuationToken?: string,
    ) => Observable<{ result: T[]; continuation_token?: string }>,
    continuationToken?: string,
): Observable<T[]> {
    return loadFn(continuationToken).pipe(
        switchMap((resp) => {
            if (resp.continuation_token) {
                return fetchAll(loadFn, resp.continuation_token).pipe(
                    map((nextData) => [...resp.result, ...nextData]),
                );
            }
            return of(resp.result);
        }),
    );
}
