import { Field, ValueType } from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts/src/thrift-parser';
import { combineLatest, Observable, switchMap } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceObjectType,
    parseNamespaceType,
    StructureType,
    ThriftAstMetadata,
} from '@cc/app/api/utils';

import { MetadataFormExtension, MetadataFormExtensionResult } from './metadata-form-extension';

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
    namespace: string
): MetadataFormData {
    return data
        ? [data, ...getAliases(data)].find((d) => d.type === type && d.namespace === namespace)
        : null;
}

export function isTypeWithAliases(
    data: MetadataFormData,
    type: string,
    namespace: string
): boolean {
    return Boolean(getByType(data, type, namespace));
}

type ObjectAst = JsonAST[keyof JsonAST][keyof JsonAST[keyof JsonAST]];

export class MetadataFormData<T extends ValueType = ValueType, M extends ObjectAst = ObjectAst> {
    typeGroup: TypeGroup;

    namespace: string;
    type: T;

    objectType?: StructureType;
    ast?: M;

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

    get isRequired() {
        return this.field?.option === 'required' || this.trueParent?.objectType === 'union';
    }

    /**
     * The first one identified is used
     */
    extensionResult$: Observable<MetadataFormExtensionResult>;

    constructor(
        public metadata: ThriftAstMetadata[],
        namespace: string,
        type: T,
        public field?: Field,
        public parent?: MetadataFormData,
        public extensions?: MetadataFormExtension[]
    ) {
        this.setNamespaceType(namespace, type);
        this.setTypeGroup();
        if (this.typeGroup === TypeGroup.Object) this.setNamespaceObjectType();
    }

    private setNamespaceType(namespace: string, type: T) {
        const namespaceType = parseNamespaceType<T>(type, namespace);
        this.namespace = namespaceType.namespace;
        this.type = namespaceType.type;
        this.extensionResult$ = combineLatest(
            (this.extensions || []).map(({ determinant }) => determinant(this))
        ).pipe(
            map((determined) => this.extensions.filter((_, idx) => determined[idx])),
            switchMap((extensions) => combineLatest(extensions.map((e) => e.extension(this)))),
            pluck(0),
            shareReplay({ refCount: true, bufferSize: 1 })
        );
    }

    private setTypeGroup(type: ValueType = this.type) {
        this.typeGroup = isComplexType(type)
            ? TypeGroup.Complex
            : isPrimitiveType(this.type)
            ? TypeGroup.Primitive
            : TypeGroup.Object;
    }

    private setNamespaceObjectType() {
        const namespaceObjectType = parseNamespaceObjectType(
            this.metadata,
            this.namespace,
            this.type as string
        );
        this.objectType = namespaceObjectType.objectType;
        this.ast = (namespaceObjectType.namespaceMetadata.ast[this.objectType] as unknown)[
            this.type
        ] as M;
    }
}
