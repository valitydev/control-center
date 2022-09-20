import { NgModule } from '@angular/core';

import { DomainStoreService } from './domain-store.service';
import { PaymentProcessingService } from './payment-processing.service';
import { RoutingRulesModule } from './routing-rules';

@NgModule({
    imports: [RoutingRulesModule],
    providers: [PaymentProcessingService, DomainStoreService],
})
/**
 * @deprecated
 */
export class DamselModule {}
