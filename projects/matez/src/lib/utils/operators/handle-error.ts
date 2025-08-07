import { EMPTY, MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../async';

export function handleError<T>(
    handler: (err: unknown) => void,
    result: PossiblyAsync<T> = EMPTY,
): MonoTypeOperatorFunction<T> {
    return (source) =>
        source.pipe(
            catchError((err) => {
                handler(err);
                return getPossiblyAsyncObservable(result);
            }),
        );
}
