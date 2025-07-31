import { MonoTypeOperatorFunction, tap } from 'rxjs';

export function tapLog<T>(message: string = `Log`): MonoTypeOperatorFunction<T> {
    return (source) => {
        return source.pipe(tap((value) => console.log(`${message}:`, value)));
    };
}
