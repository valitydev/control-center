import { Modification } from '@vality/domain-proto/claim_management';

import { MODIFICATIONS_NAME_TREE } from './types/modifications-name-tree';

export function getModificationName(modification: Modification) {
    let value: unknown = modification;
    let name: unknown = MODIFICATIONS_NAME_TREE;
    while (value) {
        if (typeof value === 'object') {
            const key = Object.keys(value).find((k) => Object.keys(name).includes(k));
            value = value[key];
            name = name[key];
        }
        if (!name) {
            console.error('Unknown modification:', modification);
            return 'Unknown Modification';
        }
        if (typeof name === 'string') {
            return name + ' Modification';
        }
    }
}
