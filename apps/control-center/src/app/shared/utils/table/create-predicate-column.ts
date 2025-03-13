import { Predicate } from '@vality/domain-proto/domain';
import { createColumn } from '@vality/matez';

import { formatPredicate } from './format-predicate';

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
