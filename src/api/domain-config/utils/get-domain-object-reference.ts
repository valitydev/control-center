import { DomainObject, Reference } from '@vality/domain-proto/domain';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

export function getDomainObjectReference(domainObject: DomainObject): Reference {
    return { [getUnionKey(domainObject)]: getUnionValue(domainObject).ref };
}
