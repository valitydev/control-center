import { Observable, of, from } from 'rxjs';

import { PossiblyAsync, isAsync } from './is-async';

export function getPossiblyAsyncObservable<T>(possiblyAsync: PossiblyAsync<T>): Observable<T> {
    return isAsync(possiblyAsync) ? from(possiblyAsync) : of(possiblyAsync);
}
