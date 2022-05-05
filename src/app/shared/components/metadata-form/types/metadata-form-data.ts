import { Field, ValueType } from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts/src/thrift-parser';
import { Observable, combineLatest, switchMap } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceObjectType,
    parseNamespaceType,
    StructureType,
    ThriftAstMetadata,
} from '@cc/app/api/utils';

export interface MetadataFormExtensionResult {
    options?: {
        value: unknown;
        label?: string;
        details?: string | object;
    }[];
    generate?: () => Observable<unknown>;
}

export type MetadataFormExtension = {
    determinant: (data: MetadataFormData) => Observable<boolean>;
    extension: (data: MetadataFormData) => Observable<MetadataFormExtensionResult>;
};

export enum TypeGroup {
    Complex = 'complex',
    Primitive = 'primitive',
    Object = 'object',
}

export function getAliases(data: MetadataFormData) {
    const path: MetadataFormData[] = data.parent ? [data.parent] : [];
    while (path[path.length - 1]?.objectType === 'typedef') {
        path.push(path[path.length - 1].parent);
    }
    return path;
}

export function getByType(data: MetadataFormData, type: string, namespace: string) {
    return [data, ...getAliases(data)].find((d) => d.type === type && d.namespace === namespace);
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
        let data: MetadataFormData = this as MetadataFormData;
        while (data.parent?.objectType === 'typedef') {
            data = data.parent;
        }
        return data;
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
