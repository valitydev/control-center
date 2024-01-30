import { Failure } from '@vality/domain-proto/domain';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

function getFailureMessageTree(failure: Failure, withReason = true, level = Infinity) {
    if (!failure) {
        return '';
    }
    return (
        (failure.code || '') +
        (withReason && failure.reason ? ` (${failure.reason})` : '') +
        (level > 1 && failure?.sub
            ? ` > ${getFailureMessageTree(failure.sub, withReason, level - 1)}`
            : '')
    );
}

export function createFailureColumn<T extends object>(
    selectFailure: (d: T) => PossiblyAsync<Failure>,
    selectNoFailureMessage: (d: T) => PossiblyAsync<string> = () => '',
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    return {
        field: 'failure',
        formatter: (d) =>
            getPossiblyAsyncObservable(selectNoFailureMessage(d)).pipe(
                switchMap((msg) => {
                    if (msg) {
                        return of(msg);
                    }
                    return getPossiblyAsyncObservable(selectFailure(d)).pipe(
                        map((failure) => getFailureMessageTree(failure, false, 2)),
                    );
                }),
            ),
        description: (d) =>
            getPossiblyAsyncObservable(selectFailure(d)).pipe(
                map((failure) => failure?.reason || ''),
            ),
        tooltip: (d) =>
            getPossiblyAsyncObservable(selectFailure(d)).pipe(
                map((failure) => getFailureMessageTree(failure?.sub?.sub)),
            ),
        ...params,
    } as ColumnObject<T>;
}
