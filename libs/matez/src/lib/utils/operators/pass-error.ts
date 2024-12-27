import { catchError, EMPTY, MonoTypeOperatorFunction, of } from 'rxjs';

export function passError<T>(
    handler: (err: unknown) => void,
    value?: T,
): MonoTypeOperatorFunction<T> {
    return (source) =>
        source.pipe(
            catchError((err) => {
                handler(err);
                if (arguments.length >= 2) {
                    return of(value as T);
                }
                return EMPTY;
            }),
        );
}
