import * as claim_management from '@vality/domain-proto/lib/claim_management/gen-nodejs/claim_management_types';
import * as base from '@vality/domain-proto/lib/domain_config/gen-nodejs/base_types';
import * as domain_config from '@vality/domain-proto/lib/domain_config/gen-nodejs/domain_config_types';
import * as domain from '@vality/domain-proto/lib/domain_config/gen-nodejs/domain_types';
import * as geo_ip from '@vality/domain-proto/lib/geo_ip/gen-nodejs/geo_ip_types';
import * as merch_stat from '@vality/domain-proto/lib/merch_stat/gen-nodejs/merch_stat_types';
import metadata from '@vality/domain-proto/lib/metadata.json';
import * as payment_processing from '@vality/domain-proto/lib/payment_processing/gen-nodejs/payment_processing_types';

import { createThriftInstanceUtils } from '@cc/app/api/utils';

const NAMESPACES = {
    base,
    domain,
    domain_config,
    claim_management,
    geo_ip,
    merch_stat,
    payment_processing,
};

export const {
    createThriftInstance: createDamselInstance,
    thriftInstanceToObject: damselInstanceToObject,
} = createThriftInstanceUtils(metadata, NAMESPACES);
