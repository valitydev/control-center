import type { Field } from '@vality/tsthrift';

import { ThriftData } from '../../models';

import { isComplexType } from './is-complex-type';

export function fromJson(value: unknown, data: ThriftData): unknown {
    if (value == null) {
        return value;
    }

    const trueData = data.trueTypeNode.data;
    const type = trueData.type;
    if (isComplexType(type)) {
        switch (type.name) {
            case 'list':
                return Array.from(value as unknown[]).map((item) =>
                    fromJson(item, trueData.create({ type: type.valueType })),
                );
            case 'set':
                return new Set(
                    Array.from(value as Set<unknown> | unknown[]).map((item) =>
                        fromJson(item, trueData.create({ type: type.valueType })),
                    ),
                );
            case 'map': {
                const entries =
                    value instanceof Map
                        ? Array.from(value.entries())
                        : (value as [unknown, unknown][]);
                return new Map(
                    entries.map(([key, item]): [unknown, unknown] => [
                        fromJson(key, trueData.create({ type: type.keyType })),
                        fromJson(item, trueData.create({ type: type.valueType })),
                    ]),
                );
            }
        }
    }

    if (
        (trueData.objectType === 'struct' ||
            trueData.objectType === 'union' ||
            trueData.objectType === 'exception') &&
        typeof value === 'object' &&
        !Array.isArray(value)
    ) {
        const fields = (trueData.ast ?? []) as Field[];
        return Object.fromEntries(
            Object.entries(value).map(([name, item]) => {
                const field = fields.find((candidate) => candidate.name === name);
                return [name, field ? fromJson(item, trueData.create({ field })) : item];
            }),
        );
    }

    return value;
}
