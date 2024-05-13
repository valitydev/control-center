import { Modification } from '@vality/domain-proto/claim_management';
import { getUnionKey } from '@vality/ng-thrift';
import isObject from 'lodash-es/isObject';

import { MODIFICATIONS_NAME_TREE } from './types/modifications-name-tree';

export function getModificationName(modification: Modification) {
    let currentValue: unknown = modification;
    let currentName: unknown = MODIFICATIONS_NAME_TREE;
    while (isObject(currentName) && isObject(currentValue)) {
        const key = Object.keys(currentValue).find((k) => Object.keys(currentName).includes(k));
        currentValue = currentValue?.[key];
        currentName = currentName?.[key];
    }
    return typeof currentName === 'string'
        ? `${currentName} Modification`
        : getUnionKey(modification);
}
