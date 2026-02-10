import { LimitedVersionedObject, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { ThriftFormExtensionOption, getUnionValue } from '@vality/ng-thrift';

import { getDomainObjectReference } from '~/api/domain-config';

import { getDomainObjectDetails, getReferenceId } from '../../../utils';

export function getDomainObjectOption(o: LimitedVersionedObject): ThriftFormExtensionOption {
    return {
        value: getReferenceId(o.ref),
        label: o.name,
        details: o,
    };
}

export function getFullDomainObjectOption(o: VersionedObject): ThriftFormExtensionOption {
    return {
        value: getReferenceId(getDomainObjectReference(o.object)),
        label: getDomainObjectDetails(o.object).label,
        details: getUnionValue(o.object).data,
    };
}
