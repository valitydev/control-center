import { Predicate } from '@vality/domain-proto/domain';
import { createColumn } from '@vality/ng-core';

import { formatPredicate } from '.';

export const createPredicateColumn = createColumn(
    ({ predicate }: { predicate: Predicate }) => {
        const value = formatPredicate(predicate);
        return {
            value,
            color: {
                True: 'success',
                False: 'warn',
            }[value],
        };
    },
    { header: 'Predicate' },
);
