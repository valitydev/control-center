import { DomainObject } from '@vality/domain-proto/domain';
import { ValuesType } from 'utility-types';

import { getUnionKey, getUnionValue } from '../../../../../utils';
import { MetadataFormExtensionOption } from '../../../components/metadata-form';
import { getDomainObjectValueDetailsFn } from '../../../components/thrift-api-crud';

export function getDomainObjectValueOptionFn(
    key: keyof DomainObject,
): (o: ValuesType<DomainObject>) => MetadataFormExtensionOption {
    const getDomainObjectDetails = getDomainObjectValueDetailsFn(key);
    return (o) => {
        const details = getDomainObjectDetails(o);
        return {
            value: details.id,
            label: details.label,
            details: o,
        };
    };
}

export function getDomainObjectOption(o: DomainObject): MetadataFormExtensionOption {
    return getDomainObjectValueOptionFn(getUnionKey(o))(getUnionValue(o));
}
