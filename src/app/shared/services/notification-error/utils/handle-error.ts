import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function handleError<T>(
    errorHandler: (error: unknown, message?: string) => void,
    message?: string,
    result: Observable<T> = EMPTY,
) {
    return (source: Observable<T>): Observable<T> =>
        source.pipe(
            catchError((err) => {
                errorHandler(err, message);
                return result;
            }),
        );
}
