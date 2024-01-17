import { Predicate } from '@vality/domain-proto/domain';
import {
    ColumnObject,
    TagColumn,
    PossiblyAsync,
    getPossiblyAsyncObservable,
} from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { formatPredicate } from './format-predicate';

export function createPredicateColumn<T extends object>(
    field: ColumnObject<T>['field'],
    select: (d: T) => PossiblyAsync<Predicate>,
    params: Partial<ColumnObject<T>> = {},
): TagColumn<T> {
    const formatter = (d: T) =>
        getPossiblyAsyncObservable(select(d)).pipe(map((predicate) => formatPredicate(predicate)));
    return {
        field,
        formatter,
        type: 'tag',
        sortable: true,
        typeParameters: {
            label: formatter,
            tags: {
                /* eslint-disable @typescript-eslint/naming-convention */
                True: { color: 'success' },
                False: { color: 'warn' },
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        ...params,
    } as TagColumn<T>;
}
