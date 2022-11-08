import { compareDifferentTypes } from '@vality/ng-core';
import { ValueType, SetType, MapType, ListType, Field } from '@vality/thrift-ts';
import isEmpty from 'lodash-es/isEmpty';
import isObject from 'lodash-es/isObject';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { MetadataFormData, TypeGroup } from '../../metadata-form';
import { getEntries } from './get-entries';
import {
    MetadataViewExtension,
    getFirstDeterminedExtensionsResult,
} from './metadata-view-extension';

export type Key = {
    value: string | number;
    data?: MetadataFormData;
};

interface KeyValueData {
    keys: Key[];
    value: any;
    data: MetadataFormData;
}

export class Inline implements KeyValueData {
    get isEmpty() {
        return isObject(this.value) ? isEmpty(this.value) : !this.value;
    }

    get isIndex() {
        return this.keys.length === 1 && typeof this.keys[0].value === 'number';
    }

    get isLeaf() {
        return !isObject(this.xvalue);
    }

    get xvalue() {
        if (this.isEmpty) {
            return null;
        }
        if (this.data.trueTypeNode.data.objectType === 'union') {
            const [unionKey, unionValue] = getEntries(this.value)[0];
            if (isObject(unionValue) ? isEmpty(unionValue) : !unionValue) return unionKey;
        }
        return this.value;
    }

    constructor(public keys: Key[], public value: any, public data: MetadataFormData) {}
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

function getKeyValues(
    value: any,
    parentData: MetadataFormData,
    extensions: MetadataViewExtension[]
): Observable<KeyValueData[]> {
    const extensionResult$ = getFirstDeterminedExtensionsResult(extensions, parentData, value);
    return extensionResult$.pipe(
        switchMap((extensionResult) => {
            if (extensionResult)
                return of([
                    {
                        keys: extensionResult.key ? [{ value: extensionResult.key }] : [],
                        value: extensionResult.value ?? value,
                        data: parentData,
                    },
                ]);
            if (!isObject(value)) return of([{ keys: [], value, data: parentData }]);
            const types = getTypes(parentData);
            return combineLatest(
                getEntries(value).map(([key, v]) => {
                    const keys = [
                        {
                            value: key,
                            data: types.keyType
                                ? parentData.create({
                                      type: types.keyType,
                                  })
                                : undefined,
                        },
                    ];
                    const data = parentData.create({
                        field: types.fields?.find((f) => f.name === key),
                        type: types.valueType,
                    });
                    if (isObject(v) && !keys.at(-1).data) {
                        const entries = getEntries(v);
                        if (entries.length !== 0) {
                            const [childKey, childValue] = entries[0];
                            if (
                                entries.length === 1 &&
                                typeof childKey !== 'number' &&
                                !isObject(childKey)
                            ) {
                                return getKeyValues(v, data, extensions).pipe(
                                    map(([inline]) => {
                                        if (data.trueTypeNode.data.objectType === 'union') {
                                            if (!getEntries(childValue).length) {
                                                return { keys, value: childKey, data };
                                            } else {
                                                return {
                                                    keys: [...keys, { value: childKey, data }],
                                                    value: childValue,
                                                    data: data.create({
                                                        field: getTypes(data).fields?.find(
                                                            (f) => f.name === childKey
                                                        ),
                                                    }),
                                                };
                                            }
                                        }
                                        return { keys: [...keys, ...inline.keys], value: v, data };
                                    })
                                );
                            }
                        }
                    }
                    return of({ keys, value: v, data });
                })
            );
        })
    );
}

export class View {
    items$: Observable<Inline[]>;
    leaves$: Observable<Inline[]>;
    nodes$: Observable<Inline[]>;

    constructor(value: any, data: MetadataFormData, extensions: MetadataViewExtension[]) {
        this.items$ = getKeyValues(value, data, extensions).pipe(
            map((keyValues) =>
                keyValues
                    .map(({ keys, value, data }) => new Inline(keys, value, data))
                    .sort(({ keys: [a], value: aV }, { keys: [b], value: bV }) =>
                        !aV && bV ? 1 : !bV && aV ? -1 : compareDifferentTypes(a.value, b.value)
                    )
            )
        );
        this.nodes$ = this.items$.pipe(map((items) => items.filter((inline) => !inline.isLeaf)));
        this.leaves$ = this.items$.pipe(map((items) => items.filter((inline) => inline.isLeaf)));
    }
}
