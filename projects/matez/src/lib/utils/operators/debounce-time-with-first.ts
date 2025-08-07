import { MonoTypeOperatorFunction, debounce, interval } from 'rxjs';

export function debounceTimeWithFirst<T>(duration: number): MonoTypeOperatorFunction<T> {
    return (source) => {
        let isFirst = true;
        return source.pipe(
            debounce(() => {
                if (isFirst) {
                    isFirst = false;
                    return interval(0);
                }
                return interval(duration);
            }),
        );
    };
}
