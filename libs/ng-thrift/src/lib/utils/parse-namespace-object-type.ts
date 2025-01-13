import { JsonAST } from '@vality/thrift-ts';

import { ThriftAstMetadata, StructureType, STRUCTURE_TYPES } from '../types';

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
    let namespaceMetadata: ThriftAstMetadata | undefined;
    if (include) {
        namespaceMetadata = metadata.reverse().find((m) => m.path === include[namespace].path);
    }
    if (!namespaceMetadata) {
        namespaceMetadata = metadata.reverse().find((m) => m.name === namespace);
    }
    const objectType = Object.keys((namespaceMetadata as ThriftAstMetadata)?.ast ?? {}).find(
        (t) => (namespaceMetadata as ThriftAstMetadata)?.ast?.[t as keyof JsonAST]?.[type],
    ) as StructureType;
    if (!objectType || !STRUCTURE_TYPES.includes(objectType)) {
        throw new Error(`Unknown thrift structure type: ${objectType}`);
    }
    return {
        namespaceMetadata: namespaceMetadata as ThriftAstMetadata,
        objectType,
        include: {
            ...(namespaceMetadata as ThriftAstMetadata).ast.include,
            ...{ [namespace]: { path: (namespaceMetadata as ThriftAstMetadata).path } },
        },
    };
}
