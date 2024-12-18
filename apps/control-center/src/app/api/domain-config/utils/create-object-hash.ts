import { toJson } from '@vality/ng-thrift';

export function createObjectHash(obj: unknown): string {
    return JSON.stringify(toJson(obj));
}
