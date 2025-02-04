import { DomainObject } from '@vality/domain-proto/domain';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { ValuesType } from 'utility-types';

import { MetadataFormExtensionOption } from '../../../../../../../../libs/ng-thrift/src/lib/components/thrift-editor/components/thrift-form';
import { getDomainObjectValueDetailsFn } from '../../../components/thrift-api-crud';

export function getDomainObjectValueOptionFn(
    key: keyof DomainObject,
): (o: ValuesType<DomainObject>) => MetadataFormExtensionOption {
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

export function getDomainObjectOption(o: DomainObject): MetadataFormExtensionOption {
    return getDomainObjectValueOptionFn(getUnionKey(o))(getUnionValue(o));
}
