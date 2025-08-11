import { isEmpty, negate } from 'lodash-es';

import { Params } from '@angular/router';

import { Serializer } from '../types/serializer';

export function serializeQueryParam(value: unknown, serializers: Serializer[] = []): string {
    const serializer = serializers
        .sort((a, b) => b.id.length - a.id.length)
        .find((s) => s.recognize(value));
    return serializer ? serializer.id + serializer.serialize(value) : JSON.stringify(value);
}

export function serializeQueryParams(
    params: object,
    filter: (param: unknown, key: string) => boolean = negate(isEmpty),
    serializers: Serializer[] = [],
): Params {
    return Object.entries(params).reduce((acc, [k, v]) => {
        if (filter(v, k)) {
            acc[k] = serializeQueryParam(v, serializers);
        }
        return acc;
    }, {} as Params);
}
