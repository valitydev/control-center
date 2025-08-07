import { Field, JsonAST, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '../../types';

export function getThriftObjectFieldType<T extends ValueType>(
    metadata: ThriftAstMetadata[],
    ns: string,
    objectType: string,
    fieldName: string,
): T {
    const nsAst = metadata.find(({ name }) => name === ns)?.ast as JsonAST;
    return (
        Array.from(Object.values(nsAst)).find((v) => v[objectType])?.[objectType] as Field[]
    ).find((f) => f.name === fieldName)?.type as T;
}
