import { DomainObject } from '@vality/domain-proto/domain';
import { ThriftFormExtensionOption, getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { ValuesType } from 'utility-types';

import { getDomainObjectValueDetailsFn } from '../../../components/thrift-api-crud';

export function getDomainObjectValueOptionFn(
    key: keyof DomainObject,
): (o: ValuesType<DomainObject>) => ThriftFormExtensionOption {
    const getDomainObjectDetails = getDomainObjectValueDetailsFn(key);
    return (o) => {
        const details = getDomainObjectDetails(o);
        return {
            value: details.id,
            label:
                String(details.id) === details.label
                    ? (details.description ?? details.label)
                    : details.label,
            details: o,
        };
    };
}

export function getDomainObjectOption(o: DomainObject): ThriftFormExtensionOption {
    return getDomainObjectValueOptionFn(getUnionKey(o))(getUnionValue(o));
}
