import type { Field, Int64, ValueType } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceType,
    StructureType,
    STRUCTURE_TYPES,
} from './namespace-type';
import { ThriftAstMetadata, ThriftNamespaceContext } from './types';

export function thriftInstanceToObject<V extends any>(
    metadata: ThriftAstMetadata[],
    namespaceContext: ThriftNamespaceContext,
    namespaceName: string,
    indefiniteType: ValueType,
    value: V
): V {
    if (typeof value !== 'object' || isNil(value)) {
        return value;
    }
    const { namespace, type } = parseNamespaceType(indefiniteType, namespaceName);
    const internalThriftInstanceToObject = (t: ValueType, v: V) =>
        thriftInstanceToObject(metadata, namespaceContext, namespace, t, v);
    if (isComplexType(type)) {
        switch (type.name) {
            case 'map':
                return new Map(
                    Array.from(value as Map<any, any>).map(([k, v]) => [
                        internalThriftInstanceToObject(type.keyType, k),
                        internalThriftInstanceToObject(type.valueType, v),
                    ])
                ) as V;
            case 'list':
                return (value as any[]).map((v) =>
                    internalThriftInstanceToObject(type.valueType, v)
                ) as V;
            case 'set':
                return new Set(
                    Array.from(value as Set<any>).map((v) =>
                        internalThriftInstanceToObject(type.valueType, v)
                    )
                ) as V;
            default:
                throw new Error('Unknown complex thrift type');
        }
    } else if (isPrimitiveType(type)) {
        switch (type) {
            case 'i64':
                return (value as Int64).toNumber() as V;
            default:
                return value;
        }
    }
    const namespaceMeta = metadata.find((m) => m.name === namespace);
    const structureType = (Object.keys(namespaceMeta.ast) as StructureType[]).find(
        (t) => namespaceMeta.ast[t][type]
    );
    if (!structureType || !STRUCTURE_TYPES.includes(structureType)) {
        throw new Error('Unknown thrift structure type');
    }
    const typeMeta = namespaceMeta.ast[structureType][type];
    switch (structureType) {
        case 'exception':
            throw new Error('Unsupported structure type: exception');
        case 'typedef': {
            type TypedefType = {
                type: ValueType;
            };
            return internalThriftInstanceToObject((typeMeta as TypedefType).type, value);
        }
        case 'union': {
            const [key, val] = Object.entries(value).find(([, v]) => v !== null);
            type UnionType = Field[];
            const fieldTypeMeta = (typeMeta as UnionType).find((m) => m.name === key);
            return { [key]: internalThriftInstanceToObject(fieldTypeMeta.type, val) } as any;
        }
        default: {
            const result = {} as V;
            for (const [k, v] of Object.entries(value)) {
                type StructType = Field[];
                const fieldTypeMeta = (typeMeta as StructType).find((m) => m.name === k);
                if (v !== null && v !== undefined) {
                    result[k] = internalThriftInstanceToObject(fieldTypeMeta.type, v);
                }
            }
            return result;
        }
    }
}
