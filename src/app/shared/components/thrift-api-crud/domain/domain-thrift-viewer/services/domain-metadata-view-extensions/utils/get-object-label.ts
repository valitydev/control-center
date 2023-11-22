import { DomainObject } from '@vality/domain-proto/domain';

import { getDomainObjectValueDetailsFn } from '../../../../utils';

export function getObjectLabel(o: DomainObject[keyof DomainObject], objectKey: keyof DomainObject) {
    const details = getDomainObjectValueDetailsFn(objectKey)(o);
    return details.label ?? String(details.id);
}
