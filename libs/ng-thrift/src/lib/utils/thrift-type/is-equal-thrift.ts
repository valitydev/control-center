import { toJson } from '.';

export function isEqualThrift(a: unknown, b: unknown) {
    return JSON.stringify(toJson(a)) === JSON.stringify(toJson(b));
}
