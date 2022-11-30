import * as BaseTypes from '@vality/domain-proto/lib/domain_config/gen-nodejs/base_types';
import * as DomainConfigTypes from '@vality/domain-proto/lib/domain_config/gen-nodejs/domain_config_types';
import * as DomainTypes from '@vality/domain-proto/lib/domain_config/gen-nodejs/domain_types';

export const SUPPORTED_NAMESPACES = {
    base: BaseTypes,
    domain: DomainTypes,
    domain_config: DomainConfigTypes,
};

/**
 * @deprecated use create-thrift-instance
 */
export function getThriftInstance(namespace: string, name: string): any {
    try {
        return new SUPPORTED_NAMESPACES[namespace][name]();
    } catch (e) {
        throw new Error(`Thrift type not found: ${namespace}.${name}`);
    }
}
