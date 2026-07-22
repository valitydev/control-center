import { MonoTypeOperatorFunction, tap } from 'rxjs';

export function tapLog<T>(message: string | number = 'Log'): MonoTypeOperatorFunction<T> {
    return (source) => {
        return source.pipe(tap((value) => console.log(`${message}:`, value)));
    };
}
