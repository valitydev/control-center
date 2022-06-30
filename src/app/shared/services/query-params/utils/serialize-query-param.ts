import { Serializer } from '../types/serializer';

export function serializeQueryParam(value: unknown, serializers: Serializer[] = []): string {
    const serializer = serializers
        .sort((a, b) => b.id.length - a.id.length)
        .find((s) => s.recognize(value));
    return serializer ? serializer.id + serializer.serialize(value) : JSON.stringify(value);
}
