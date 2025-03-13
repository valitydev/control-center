import { Predicate } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';

export function invertPredicate(predicate: Predicate): {
    toggled: Predicate;
    prevAllowed: boolean;
} {
    const predicates: Predicate[] =
        getUnionKey(predicate) === 'all_of' ? Array.from(predicate.all_of) : [predicate];
    const idx = predicates.findIndex((a) => getUnionKey(a) === 'constant');
    const prevAllowed = idx !== -1 ? predicates[idx].constant : true;
    if (idx !== -1) {
        predicates.splice(idx, 1);
    }
    predicates.unshift({ constant: !prevAllowed });
    return {
        toggled: { all_of: new Set(predicates) },
        prevAllowed,
    };
}
