import { Predicate } from '@vality/domain-proto/domain';
import startCase from 'lodash-es/startCase';

import { getUnionKey } from '../../../../utils';

export function formatPredicate(predicate: Predicate) {
    if (!predicate) {
        return '';
    }
    if (getUnionKey(predicate) === 'constant') {
        return startCase(String(predicate.constant));
    }
    return startCase(getUnionKey(predicate));
}
