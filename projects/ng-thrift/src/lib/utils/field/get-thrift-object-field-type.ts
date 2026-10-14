import type { Field, Metadata, ThriftAst, ValueType } from '@vality/tsthrift';

export function getThriftObjectFieldType<T extends ValueType>(
    metadata: Metadata[],
    ns: string,
    objectType: string,
    fieldName: string,
): T {
    const nsAst = metadata.find(({ name }) => name === ns)?.ast as ThriftAst;
    return (
        Array.from(Object.values(nsAst)).find((v) => v[objectType])?.[objectType] as Field[]
    ).find((f) => f.name === fieldName)?.type as T;
}
