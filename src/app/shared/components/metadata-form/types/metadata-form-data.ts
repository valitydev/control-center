import { ThriftAstMetadata } from '@vality/domain-proto';
import { Field, ValueType } from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts/src/thrift-parser';
import { ValuesType } from 'utility-types';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceObjectType,
    parseNamespaceType,
    StructureType,
} from '@cc/utils/thrift-instance';

export enum TypeGroup {
    Complex = 'complex',
    Primitive = 'primitive',
    Object = 'object',
}

export function getAliases(data: MetadataFormData): MetadataFormData[] {
    let alias: MetadataFormData = data?.parent;
    const path: MetadataFormData[] = [];
    while (alias && alias.objectType === 'typedef' && alias.parent) {
        path.push(alias);
        alias = alias?.parent;
    }
    return path;
}

export function getByType(
    data: MetadataFormData,
    type: string,
    namespace: string,
): MetadataFormData {
    return data
        ? [data, ...getAliases(data)].find((d) => d.type === type && d.namespace === namespace)
        : null;
}

export function isTypeWithAliases(
    data: MetadataFormData,
    type: string,
    namespace: string,
): boolean {
    return Boolean(getByType(data, type, namespace));
}

export class MetadataFormData<
    T extends ValueType = ValueType,
    S extends StructureType = StructureType,
> {
    typeGroup: TypeGroup;

    namespace: string;
    type: T;

    objectType?: S;
    ast?: ValuesType<JsonAST[S]>;

    include?: JsonAST['include'];

    /**
     * Parent who is not typedef
     */
    get trueParent() {
        let data: MetadataFormData = this.parent;
        while (data?.objectType === 'typedef') {
            data = data.parent;
        }
        return data;
    }

    /**
     * Path to the object without aliases
     */
    get trueTypeNode() {
        const typedefs: MetadataFormData<ValueType, 'typedef'>[] = [];
        let currentData: MetadataFormData = this as never;
        while (currentData.objectType === 'typedef') {
            typedefs.push(currentData as never);
            currentData = currentData.create({
                type: (currentData as MetadataFormData<ValueType, 'typedef'>).ast.type,
            });
        }
        return { data: currentData, typedefs };
    }

    get isRequired() {
        return this.field?.option === 'required' || this.trueParent?.objectType === 'union';
    }

    constructor(
        public metadata: ThriftAstMetadata[],
        namespace: string,
        type: T,
        public field?: Field,
        public parent?: MetadataFormData,
    ) {
        this.setNamespaceType(namespace, type);
        this.setTypeGroup();
        if (this.typeGroup === TypeGroup.Object) {
            this.setNamespaceObjectType();
        }
    }

    create(params: { type?: ValueType; field?: Field }): MetadataFormData {
        return new MetadataFormData(
            this.metadata,
            this.namespace,
            params.type ?? params.field?.type,
            params.field,
            this as never,
        );
    }

    private setNamespaceType(namespace: string, type: T) {
        const namespaceType = parseNamespaceType(type, namespace);
        this.namespace = namespaceType.namespace;
        this.type = namespaceType.type;
    }

    private setTypeGroup(type: ValueType = this.type) {
        this.typeGroup = isComplexType(type)
            ? TypeGroup.Complex
            : isPrimitiveType(this.type)
            ? TypeGroup.Primitive
            : TypeGroup.Object;
    }

    private setNamespaceObjectType() {
        const { namespaceMetadata, objectType, include } = parseNamespaceObjectType(
            this.metadata,
            this.namespace,
            this.type as string,
            this.parent?.include,
        );
        this.objectType = objectType as never;
        this.ast = (namespaceMetadata.ast[this.objectType] as unknown)[this.type] as never;
        this.include = include;
    }
}
