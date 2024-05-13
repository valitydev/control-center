import { getUnionKey } from '@vality/ng-thrift';
import isObject from 'lodash-es/isObject';

export function getModificationNameParts(modification: unknown): string[] {
    const parts: string[] = [];
    for (let modKey = '', mod = modification; isObject(mod); ) {
        modKey = Object.keys(mod).find((k) => k.endsWith('_modification'));
        if (modKey) {
            mod = mod[modKey];
            parts.push(modKey);
        } else if ('modification' in mod) {
            mod = (mod as Record<PropertyKey, unknown>).modification;
            modKey = getUnionKey(mod) as string;
            if (modKey) {
                parts.push(modKey);
            }
        } else {
            break;
        }
    }
    return parts;
}
