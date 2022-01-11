import { ValueType } from '@vality/thrift-ts';
import difference from 'lodash-es/difference';

import { createThriftInstance } from './create-thrift-instance';
import { thriftInstanceToObject } from './thrift-instance-to-object';

export function checkNamespaces(
    metadata: { name: string }[],
    namespaces: { [N in string]: any }
): void {
    const diff = difference(
        metadata.map(({ name }) => name),
        Object.keys(namespaces)
    );
    if (diff.length) {
        console.warn('It is necessary to match the metadata and namespaces:', diff);
    }
}

export function createThriftInstanceUtils<T extends { [N in string]: any }>(
    metadata: any[],
    namespaces: T
) {
    checkNamespaces(metadata, namespaces);
    return {
        createThriftInstance: <V>(namespace: keyof T, name: ValueType, value: V) =>
            createThriftInstance(metadata, namespaces, namespace as string, name, value),
        thriftInstanceToObject: <V>(namespace: keyof T, name: ValueType, value: V) =>
            thriftInstanceToObject(metadata, namespaces, namespace as string, name, value),
    };
}
