import { Observable, Subject, catchError, merge, of, scan, takeLast } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { getProgressByCount } from '../../components/progress';

export interface ForkJoinResult<T, D = never> {
    index: number;
    data: D;
    hasError: boolean;

    result?: T;
    error?: unknown;
}

export type ForkJoinSucceededResult<T, D = never> = Omit<
    Overwrite<ForkJoinResult<T, D>, { hasError: false; result: T }>,
    'error'
>;
export type ForkJoinErrorResult<D = never> = Omit<
    Overwrite<ForkJoinResult<never, D>, { hasError: true; error: unknown }>,
    'result'
>;

export function forkJoinToResult<T, D = never>(
    sources: Observable<T>[],
    progress$?: Subject<number>,
    dataItems: D[] = [],
    concurrency = 4,
): Observable<ForkJoinResult<T, D>[]> {
    let completed = 0;
    if (progress$) {
        progress$.next(getProgressByCount(sources.length));
    }
    return merge(
        ...sources.map((source, index) =>
            source.pipe(
                map(
                    (result): ForkJoinResult<T, D> => ({
                        result,
                        hasError: false,
                        index,
                        data: dataItems[index],
                    }),
                ),
                catchError((error) => {
                    return of<ForkJoinResult<T, D>>({
                        error,
                        hasError: true,
                        index,
                        data: dataItems[index],
                    });
                }),
                finalize(() => {
                    completed += 1;
                    if (progress$) {
                        progress$.next(getProgressByCount(sources.length, completed));
                    }
                }),
            ),
        ),
        concurrency,
    ).pipe(
        scan(
            (acc, value) => {
                acc.push(value);
                return acc;
            },
            [] as ForkJoinResult<T, D>[],
        ),
        takeLast(1),
        map((r) => r.sort((a, b) => a.index - b.index)),
    );
}

export function isResultsHasError<T, D>(res: ForkJoinResult<T, D>[]): boolean {
    return res.some((r) => r.hasError);
}

export function splitResultsErrors<T, D>(
    res: ForkJoinResult<T, D>[],
): [succeeded: ForkJoinSucceededResult<T, D>[], errors: ForkJoinErrorResult<D>[]] {
    return res.reduce(
        (acc, r) => {
            acc[r.hasError ? 1 : 0].push(r as never);
            return acc;
        },
        [[], []] as [succeeded: ForkJoinSucceededResult<T, D>[], errors: ForkJoinErrorResult<D>[]],
    );
}
