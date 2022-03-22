import { Injectable } from '@angular/core';

import * as base from '../../thrift-services/damsel/gen-nodejs/base_types';
import * as domain from '../../thrift-services/damsel/gen-nodejs/domain_types';
import * as payment_processing from '../../thrift-services/damsel/gen-nodejs/payment_processing_types';
import { ProviderSettings, ThriftInstanceProvider } from '../thrift-instance-provider';

@Injectable({ providedIn: 'root' })
export class PaymentProcessingInstanceProviderService extends ThriftInstanceProvider {
    protected getProviderSettings(): ProviderSettings {
        return {
            context: {
                base,
                domain,
                payment_processing,
            },
            metadataName: 'damsel',
            defaultNamespace: 'payment_processing',
        };
    }
}
