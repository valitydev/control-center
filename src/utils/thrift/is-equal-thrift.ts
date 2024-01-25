import { toJson } from '../thrift-json-converter';

export function isEqualThrift(a: unknown, b: unknown) {
    return JSON.stringify(toJson(a)) === JSON.stringify(toJson(b));
}
