import { Observable, scan } from 'rxjs';
import { map } from 'rxjs/operators';

export function cachedHeadMap<T extends object, R>(fn: (el: T, idx: number) => R) {
    return (src$: Observable<T[] | undefined>) => {
        return src$.pipe(
            scan(
                (acc, v) => {
                    return {
                        prev: v ?? [],
                        res: (v ?? []).map((el, idx) =>
                            acc.prev[idx] === el ? acc.res[idx] : fn(el, idx),
                        ),
                    };
                },
                { prev: [], res: [] } as { prev: T[]; res: R[] },
            ),
            map(({ res }) => res),
        );
    };
}
