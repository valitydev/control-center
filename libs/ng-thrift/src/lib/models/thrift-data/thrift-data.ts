import { Field, ValueType, JsonAST } from '@vality/thrift-ts';
import { TypeDefs } from '@vality/thrift-ts/src/thrift-parser';
import { ValuesType } from 'utility-types';

import { StructureType, ThriftAstMetadata } from '../../types';
import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceObjectType,
    parseNamespaceType,
    isRequiredField,
} from '../../utils';

import { TypeGroup } from './types/type-group';

export class ThriftData<T extends ValueType = ValueType, S extends StructureType = StructureType> {
    typeGroup!: TypeGroup;

    namespace!: string;
    type!: T;

    objectType?: S;
    ast?: JsonAST[S] extends object ? ValuesType<JsonAST[S]> : never;

    include?: JsonAST['include'];

    /**
     * Parent who is not typedef
     */
    get trueParent() {
        let data: ThriftData | undefined = this.parent;
        while (data?.objectType === 'typedef') {
            data = data.parent;
        }
        return data;
    }

    /**
     * Path to the object without aliases
     */
    get trueTypeNode() {
        const typedefs: ThriftData<ValueType, 'typedef'>[] = [];
        let currentData: ThriftData = this as never;
        while (currentData.objectType === 'typedef') {
            typedefs.push(currentData as never);
            currentData = currentData.create({
                type: (
                    (currentData as ThriftData<ValueType, 'typedef'>)
                        ?.ast as never as ValuesType<TypeDefs>
                )?.type,
            });
        }
        return { data: currentData, typedefs };
    }

    get isRequired() {
        return isRequiredField(this.field) || this.trueParent?.objectType === 'union';
    }

    constructor(
        public metadata: ThriftAstMetadata[],
        namespace: string,
        type: T,
        public field?: Field,
        public parent?: ThriftData,
    ) {
        this.setNamespaceType(namespace, type);
        this.setTypeGroup();
        if (this.typeGroup === TypeGroup.Object) {
            this.setNamespaceObjectType();
        }
    }

    create(params: { type?: ValueType; field?: Field }): ThriftData {
        return new ThriftData(
            this.metadata,
            this.namespace,
            (params.type ?? params.field?.type) as ValueType,
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
        this.ast = (namespaceMetadata.ast[this.objectType] as Record<PropertyKey, never>)[
            this.type as PropertyKey
        ];
        this.include = include;
    }
}
