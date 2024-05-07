import { Predicate } from '@vality/domain-proto/domain';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

export function formatPredicate(predicate: Predicate, level = 0) {
    if (!predicate) {
        return '';
    }
    const type = getUnionKey(predicate);
    switch (type) {
        case 'constant':
            return startCase(String(predicate.constant));
        case 'any_of':
        case 'all_of': {
            const predicatesSet = getUnionValue(predicate) as
                | Predicate['all_of']
                | Predicate['any_of'];
            if (predicatesSet.size <= 1) {
                return formatPredicate(predicatesSet.keys().next().value, level + 1);
            }
            return `${startCase(getUnionKey(predicate))} ${
                predicatesSet.size <= 3
                    ? `(${Array.from(predicatesSet)
                          .map((p) => formatPredicate(p, level + 1))
                          .join(', ')})`
                    : predicatesSet.size
            }`;
        }
        case 'condition':
            return startCase(getUnionKey(getUnionValue(predicate) as Predicate['condition']));
        case 'criterion':
            return `${startCase(getUnionKey(predicate))} #${predicate.criterion.id}`;
        case 'is_not': {
            if (getUnionKey(getUnionValue(predicate) as Predicate) !== 'is_not') {
                return `${getUnionKey(predicate)} ${formatPredicate(predicate.is_not, level + 1)}`;
            }
            break;
        }
    }
    return startCase(getUnionKey(predicate));
}
