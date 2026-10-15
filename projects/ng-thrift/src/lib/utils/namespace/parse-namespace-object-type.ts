import type { Metadata, ThriftAst } from '@vality/tsthrift';

import { STRUCTURE_TYPES, StructureType } from '../../types';

export interface NamespaceObjectType {
    namespaceMetadata: Metadata;
    objectType: StructureType;
    include: ThriftAst['include'];
}

export function parseNamespaceObjectType(
    metadata: Metadata[],
    namespace: string,
    type: string,
    include?: ThriftAst['include'],
): NamespaceObjectType {
    // metadata reverse find - search for the last matching protocol if the names match (files are overwritten in the same order)
    const reversedMetadata = [...metadata].reverse();
    let namespaceMetadata: Metadata | undefined;
    if (include) {
        namespaceMetadata = reversedMetadata.find((m) => m.path === include[namespace]?.path);
    }
    if (!namespaceMetadata) {
        namespaceMetadata = reversedMetadata.find((m) => m.name === namespace);
    }
    const objectType = Object.keys((namespaceMetadata as Metadata)?.ast ?? {}).find(
        (t) => (namespaceMetadata as Metadata)?.ast?.[t as keyof ThriftAst]?.[type],
    ) as StructureType;
    if (!objectType || !STRUCTURE_TYPES.includes(objectType)) {
        throw new Error(`Unknown thrift structure type: ${objectType}`);
    }
    return {
        namespaceMetadata: namespaceMetadata as Metadata,
        objectType,
        include: {
            ...(namespaceMetadata as Metadata).ast.include,
            ...{ [namespace]: { path: (namespaceMetadata as Metadata).path } },
        },
    };
}
