import { toJson } from '.';

export function isEqualThrift<T>(a: T, b: T): boolean {
    return JSON.stringify(toJson(a)) === JSON.stringify(toJson(b));
}
