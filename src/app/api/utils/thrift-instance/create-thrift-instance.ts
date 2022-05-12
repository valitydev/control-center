import type { Field, ValueType } from '@vality/thrift-ts';
import Int64 from '@vality/thrift-ts/lib/int64';

import {
    isComplexType,
    isPrimitiveType,
    isThriftObject,
    parseNamespaceType,
    parseNamespaceObjectType,
} from './namespace-type';
import { ThriftAstMetadata, ThriftInstanceContext } from './types';

export function createThriftInstance<V>(
    metadata: ThriftAstMetadata[],
    instanceContext: ThriftInstanceContext,
    namespaceName: string,
    indefiniteType: ValueType,
    value: V
): V {
    if (isThriftObject(value)) {
        return value;
    }
    const { namespace, type } = parseNamespaceType(indefiniteType, namespaceName);
    const internalCreateThriftInstance = (t: ValueType, v: V) =>
        createThriftInstance(metadata, instanceContext, namespace, t, v);
    if (isComplexType(type)) {
        switch (type.name) {
            case 'map':
                return new Map(
                    Array.from(value as unknown as Map<any, any>).map(([k, v]) => [
                        internalCreateThriftInstance(type.keyType, k),
                        internalCreateThriftInstance(type.valueType, v),
                    ])
                ) as unknown as V;
            case 'list':
                return (value as unknown as any[]).map((v) =>
                    internalCreateThriftInstance(type.valueType, v)
                ) as unknown as V;
            case 'set':
                return Array.from(value as unknown as Set<any>).map((v) =>
                    internalCreateThriftInstance(type.valueType, v)
                ) as unknown as V;
            default:
                throw new Error('Unknown complex thrift type');
        }
    } else if (isPrimitiveType(type)) {
        switch (type) {
            case 'i64':
                return new Int64(value as any) as any;
            default:
                return value;
        }
    }
    const { namespaceMetadata, objectType } = parseNamespaceObjectType(metadata, namespace, type);
    switch (objectType) {
        case 'enum':
            return value;
        case 'exception':
            throw new Error('Unsupported structure type: exception');
        default: {
            const typeMeta = namespaceMetadata.ast[objectType][type];
            try {
                if (objectType === 'typedef') {
                    const typedefMeta = (typeMeta as { type: ValueType }).type;
                    return internalCreateThriftInstance(typedefMeta, value);
                }
                const instance = new instanceContext[namespace][type]();
                for (const [k, v] of Object.entries(value)) {
                    type StructOrUnionType = Field[];
                    const fieldTypeMeta = (typeMeta as StructOrUnionType).find((m) => m.name === k);
                    instance[k] = internalCreateThriftInstance(fieldTypeMeta.type, v);
                }
                return instance;
            } catch (error) {
                console.error(
                    'Thrift structure',
                    objectType,
                    'creation error:',
                    namespace,
                    type,
                    '(meta type:',
                    typeMeta,
                    '), value:',
                    value
                );
                throw error;
            }
        }
    }
}
