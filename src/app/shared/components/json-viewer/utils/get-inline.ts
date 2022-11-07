import { compareDifferentTypes } from '@vality/ng-core';
import { ValueType, SetType, MapType, ListType, Field } from '@vality/thrift-ts';
import isEmpty from 'lodash-es/isEmpty';
import isObject from 'lodash-es/isObject';

import { MetadataFormData, TypeGroup } from '../../metadata-form';
import { getKeyValues } from './get-key-values';

type Key = {
    value: string | number;
    data?: MetadataFormData;
};

export class Inline {
    keys: Key[];
    value: any;
    data: MetadataFormData;

    get isEmpty() {
        return isObject(this.value) ? isEmpty(this.value) : !this.value;
    }

    get isIndex() {
        return this.keys.length === 1 && typeof this.keys[0].value === 'number';
    }

    get isLeaf() {
        return !isObject(this.xvalue);
    }

    get key() {
        return this.isIndex
            ? `${(this.keys[0].value as number) + 1}.`
            : this.keys.map(({ value }) => value).join(' / ');
    }

    get xvalue() {
        if (this.isEmpty) {
            return null;
        }
        if (this.data.trueTypeNode.data.objectType === 'union') {
            const [unionKey, unionValue] = getKeyValues(this.value)[0];
            if (isObject(unionValue) ? isEmpty(unionValue) : !unionValue) return unionKey;
        }
        return this.value;
    }

    constructor(keys: Key[], value: any, data: MetadataFormData) {
        if (isObject(value) && !keys.at(-1).data) {
            const entries = getKeyValues(value);
            if (entries.length !== 0) {
                const [childKey, childValue] = entries[0];
                if (entries.length === 1 && typeof childKey !== 'number' && !isObject(childKey)) {
                    const [inline] = getInline(value, data);
                    if (
                        data.trueTypeNode.data.objectType === 'union' &&
                        !getKeyValues(childValue).length
                    ) {
                        this.keys = keys;
                        this.value = childKey;
                        this.data = data;
                        return;
                    }
                    this.keys = [...keys, ...inline.keys];
                    this.value = inline.value;
                    this.data = inline.data;
                    return;
                }
            }
        }
        this.keys = keys;
        this.value = value;
        this.data = data;
    }
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
    if (!isObject(value)) return [new Inline([], value, data)];
    const types = getTypes(data);
    return getKeyValues(value)
        .map(
            ([key, value]) =>
                new Inline(
                    [
                        {
                            value: key,
                            data: types.keyType
                                ? data.create({
                                      type: types.keyType,
                                  })
                                : undefined,
                        },
                    ],
                    value,
                    data.create({
                        field: types.fields?.find((f) => f.name === key),
                        type: types.valueType,
                    })
                )
        )
        .sort(({ keys: [a], value: aV }, { keys: [b], value: bV }) =>
            !aV && bV ? 1 : !bV && aV ? -1 : compareDifferentTypes(a, b)
        );
}

export class View {
    leaves: Inline[];
    nodes: Inline[];

    constructor(value: any, data: MetadataFormData) {
        const items = getInline(value, data);
        this.nodes = items.filter((inline) => !inline.isLeaf);
        this.leaves = items.filter((inline) => inline.isLeaf);
    }
}
