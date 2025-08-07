import { Observable, of } from 'rxjs';

import { fromAsync } from './from-async';
import { PossiblyAsync, isAsync } from './is-async';

export function getPossiblyAsyncObservable<T>(possiblyAsync: PossiblyAsync<T>): Observable<T> {
    return isAsync(possiblyAsync) ? fromAsync(possiblyAsync) : of(possiblyAsync);
}
