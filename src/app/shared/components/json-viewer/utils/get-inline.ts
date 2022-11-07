import { compareDifferentTypes } from '@vality/ng-core';
import { ValueType, SetType, MapType, ListType, Field } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

import { MetadataFormData, TypeGroup } from '../../metadata-form';
import { getKeyValues } from './get-key-values';

type Key = string | number;

export interface Inline {
    keys: Key[];
    value: any;
    data: MetadataFormData;
    keyData?: MetadataFormData;
}

export function getInlineNode({ keys, value, data, keyData }: Inline): Inline {
    if (isNil(value)) {
        return null;
    }
    if (isObject(value) && !keyData) {
        const entries = getKeyValues(value);
        if (entries.length === 0) {
            return { keys, value: null, data, keyData };
        }
        const [childKey, childValue] = entries[0];
        if (
            entries.length === 1 &&
            typeof childKey !== 'number' &&
            !isObject(childKey)
            // &&
            // data.trueParent?.objectType !== 'union'
        ) {
            const [inline] = getInline(value, data);
            if (data.trueTypeNode.data.objectType === 'union' && !getKeyValues(childValue).length)
                return { keys, value, data, keyData };
            return { ...inline, keys: [...keys, ...inline.keys] };
        }
    }
    return { keys, value, data, keyData };
}

function getTypes(srcData: MetadataFormData): {
    keyType?: ValueType;
    valueType?: ValueType;
    fields?: Field[];
} {
    const data = srcData.trueTypeNode.data;
    switch (data.typeGroup) {
        case TypeGroup.Object: {
            switch (data.objectType) {
                case 'struct':
                    return { fields: (data as MetadataFormData<ValueType, 'struct'>).ast };
                case 'union':
                    return { fields: (data as MetadataFormData<ValueType, 'union'>).ast };
            }
            return;
        }
        case TypeGroup.Complex: {
            if ((data as MetadataFormData<SetType | MapType | ListType>).type.name === 'map') {
                return {
                    keyType: (data as MetadataFormData<MapType>).type.keyType,
                    valueType: (data as MetadataFormData<MapType>).type.valueType,
                };
            }
            return {
                valueType: (data as MetadataFormData<SetType | ListType>).type.valueType,
            };
        }
    }
}

export function getInline(value: any, data: MetadataFormData): Inline[] {
    if (!isObject(value)) return [{ keys: [], value, data }];
    const types = getTypes(data);
    return getKeyValues(value)
        .map(([key, value]) => {
            return getInlineNode({
                keys: [key],
                value,
                data: data.create({
                    field: types.fields?.find((f) => f.name === key),
                    type: types.valueType,
                }),
                keyData: types.keyType
                    ? data.create({
                          type: types.keyType,
                      })
                    : undefined,
            });
        })
        .sort(({ keys: [a], value: aV }, { keys: [b], value: bV }) =>
            !aV && bV ? 1 : !bV && aV ? -1 : compareDifferentTypes(a, b)
        );
}
