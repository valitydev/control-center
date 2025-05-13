import { DomainObject } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';

import { SECRETS_OBJECTS } from '../consts/secrets-objects';

export function isSecretObject(obj: DomainObject): boolean {
    return (SECRETS_OBJECTS as readonly string[]).includes(getUnionKey(obj));
}
