import { ThriftAstMetadata } from '@vality/domain-proto';
import { JsonAST } from '@vality/thrift-ts';

import type { ListType, MapType, SetType, ThriftType, ValueType } from '@vality/thrift-ts';

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

export function isThriftObject(value: unknown): boolean {
    return typeof value?.['write'] === 'function' && typeof value?.['read'] === 'function';
}

export function isComplexType(type: ValueType): type is SetType | ListType | MapType {
    return typeof type === 'object';
}

export function isPrimitiveType(type: ValueType): type is ThriftType {
    return PRIMITIVE_TYPES.includes(type as never);
}

export type StructureType = keyof JsonAST;
export const STRUCTURE_TYPES: StructureType[] = ['typedef', 'struct', 'union', 'exception', 'enum'];

export interface NamespaceObjectType {
    namespaceMetadata: ThriftAstMetadata;
    objectType: StructureType;
    include: JsonAST['include'];
}

export function parseNamespaceObjectType(
    metadata: ThriftAstMetadata[],
    namespace: string,
    type: string,
    include?: JsonAST['include'],
): NamespaceObjectType {
    // metadata reverse find - search for the last matching protocol if the names match (files are overwritten in the same order)
    let namespaceMetadata: ThriftAstMetadata;
    if (include)
        namespaceMetadata = metadata.reverse().find((m) => m.path === include[namespace].path);
    if (!namespaceMetadata)
        namespaceMetadata = metadata.reverse().find((m) => m.name === namespace);
    const objectType = Object.keys(namespaceMetadata.ast).find(
        (t) => namespaceMetadata.ast[t][type],
    ) as StructureType;
    if (!objectType || !STRUCTURE_TYPES.includes(objectType)) {
        throw new Error(`Unknown thrift structure type: ${objectType}`);
    }
    return {
        namespaceMetadata,
        objectType,
        include: {
            ...namespaceMetadata.ast.include,
            ...{ [namespace]: { path: namespaceMetadata.path } },
        },
    };
}

export interface NamespaceType<T extends ValueType = ValueType> {
    namespace: string;
    type: T;
}

export function parseNamespaceType<T extends ValueType>(
    type: T,
    namespace?: string,
): NamespaceType<T> {
    if (!isPrimitiveType(type) && !isComplexType(type) && type.includes('.')) {
        [namespace, type as unknown] = type.split('.');
    }
    return { namespace, type };
}
