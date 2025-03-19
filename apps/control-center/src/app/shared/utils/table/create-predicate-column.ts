import { Predicate } from '@vality/domain-proto/domain';
import { BaseValue, Color, Value, createColumn } from '@vality/matez';

import {
    formatPredicate,
    getPredicateBoolean,
    isPrimitiveBooleanPredicate,
} from './format-predicate';

export const createPredicateColumn = createColumn(
    ({ predicate, toggle }: { predicate: Predicate; toggle?: Value['click'] }) => {
        const value = formatPredicate(predicate);
        if (toggle) {
            return {
                type: 'toggle',
                value: getPredicateBoolean(predicate),
                description: isPrimitiveBooleanPredicate(predicate) ? '' : value,
                click: toggle,
            };
        }
        return {
            value,
            color: {
                True: 'success' as Color,
                False: 'warn' as Color,
            }[value],
        } as BaseValue;
    },
    { header: 'Predicate' },
);
