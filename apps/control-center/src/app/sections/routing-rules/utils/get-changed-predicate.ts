import { Predicate } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';

export function getPredicateBoolean(predicate: Predicate) {
    switch (getUnionKey(predicate)) {
        case 'all_of':
            return Array.from(predicate.all_of).find((p) => p.constant)?.constant ?? true;
        case 'constant':
            return predicate.constant;
        default:
            return true;
    }
}

/**
 * @param allowedOrToggle - If provided, sets the constant to this value. If not provided, toggles the current constant value (acts as a toggle)
 */
export function getChangedPredicate(predicate: Predicate, allowedOrToggle?: boolean): Predicate {
    const predicates: Predicate[] =
        getUnionKey(predicate) === 'all_of' ? Array.from(predicate.all_of) : [predicate];
    const idx = predicates.findIndex((a) => getUnionKey(a) === 'constant');
    if (idx !== -1) {
        predicates.splice(idx, 1);
    }
    predicates.unshift({
        constant: allowedOrToggle !== undefined ? allowedOrToggle : !getPredicateBoolean(predicate),
    });
    return { all_of: new Set(predicates) };
}
