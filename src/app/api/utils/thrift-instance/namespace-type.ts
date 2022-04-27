import type { ListType, MapType, SetType, ThriftType, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';

export const PRIMITIVE_TYPES = [
    'int',
    'bool',
    'i8',
    'i16',
    'i32',
    'i64',
    'string',
    'double',
    'binary',
] as const;

export function isThriftObject(value: any): boolean {
    return typeof value?.write === 'function' && typeof value?.read === 'function';
}

export function isComplexType(type: ValueType): type is SetType | ListType | MapType {
    return typeof type === 'object';
}

export function isPrimitiveType(type: ValueType): type is ThriftType {
    return PRIMITIVE_TYPES.includes(type as never);
}

export const STRUCTURE_TYPES = ['typedef', 'struct', 'union', 'exception', 'enum'] as const;
export type StructureType = typeof STRUCTURE_TYPES[number];

export function parseNamespaceObjectType(
    metadata: ThriftAstMetadata[],
    namespace: string,
    type: string
) {
    const namespaceMetadata = metadata.find((m) => m.name === namespace);
    const objectType = (Object.keys(namespaceMetadata.ast) as StructureType[]).find(
        (t) => namespaceMetadata.ast[t][type]
    );
    if (!objectType || !STRUCTURE_TYPES.includes(objectType)) {
        throw new Error(`Unknown thrift structure type: ${objectType}`);
    }
    return { namespaceMetadata, objectType };
}

export interface NamespaceType {
    namespace: string;
    type: ValueType;
}

export function parseNamespaceType(type: ValueType, namespace?: string): NamespaceType {
    if (!isPrimitiveType(type) && !isComplexType(type) && type.includes('.')) {
        [namespace, type] = type.split('.');
    }
    return { namespace, type };
}
