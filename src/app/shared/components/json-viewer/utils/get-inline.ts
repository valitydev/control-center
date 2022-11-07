import { compareDifferentTypes } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

import { MetadataFormData } from '../../metadata-form';
import { getKeyValues } from './get-key-values';

type Key = string | number;

interface Inline {
    keys: Key[];
    value: any;
    data?: MetadataFormData;
}

export function getInlineNode({ keys, value }: Inline): Inline {
    if (isNil(value)) {
        return null;
    }
    if (isObject(value)) {
        const entries = getKeyValues(value);
        if (entries.length === 0) {
            return { keys, value: null };
        }
        const [childKey, childValue] = entries[0];
        if (entries.length === 1 && typeof childKey !== 'number' && typeof keys[0] !== 'number') {
            return getInlineNode({ keys: [...keys, childKey], value: childValue });
        }
    }
    return { keys, value };
}

export function getInline(value: any): Inline[] {
    if (!isObject(value)) return [{ keys: [], value }];
    return getKeyValues(value)
        .map(([key, value]) => getInlineNode({ keys: [key], value }))
        .sort(({ keys: [a], value: aV }, { keys: [b], value: bV }) =>
            !aV && bV ? 1 : !bV && aV ? -1 : compareDifferentTypes(a, b)
        );
}
