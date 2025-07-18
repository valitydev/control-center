import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import { ThriftFormExtensionOption } from '@vality/ng-thrift';

import { getReferenceId } from '../../../components/thrift-api-crud';

export function getDomainObjectOption(o: LimitedVersionedObject): ThriftFormExtensionOption {
    return {
        value: getReferenceId(o.ref),
        label: o.name,
        details: o,
    };
}
