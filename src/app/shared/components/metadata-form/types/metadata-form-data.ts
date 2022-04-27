import { Field, ValueType } from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts/src/thrift-parser';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceObjectType,
    parseNamespaceType,
    StructureType,
    ThriftAstMetadata,
} from '@cc/app/api/utils';

export enum TypeGroup {
    Complex = 'complex',
    Primitive = 'primitive',
    Object = 'object',
}

export class MetadataFormData<
    T extends ValueType = ValueType,
    M extends JsonAST[keyof JsonAST][keyof JsonAST[keyof JsonAST]] = JsonAST[keyof JsonAST][keyof JsonAST[keyof JsonAST]]
> {
    typeGroup: TypeGroup;

    namespace: string;
    type: T;

    objectType?: StructureType;
    ast?: M;

    constructor(
        public metadata: ThriftAstMetadata[],
        namespace: string,
        type: T,
        public field?: Field,
        public parent?: MetadataFormData
    ) {
        const namespaceType = parseNamespaceType<T>(type, namespace);
        this.namespace = namespaceType.namespace;
        this.type = namespaceType.type;
        if (isComplexType(this.type)) {
            this.typeGroup = TypeGroup.Complex;
        } else if (isPrimitiveType(this.type)) {
            this.typeGroup = TypeGroup.Primitive;
        } else {
            this.typeGroup = TypeGroup.Object;
            const namespaceObjectType = parseNamespaceObjectType(
                this.metadata,
                this.namespace,
                this.type
            );
            this.objectType = namespaceObjectType.objectType;
            this.ast = (namespaceObjectType.namespaceMetadata.ast[this.objectType] as unknown)[
                this.type
            ] as M;
        }
    }
}
