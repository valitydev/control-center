import { NgModule } from '@angular/core';

import { ClaimManagementService } from './claim-management.service';
import { DomainStoreService } from './domain-store.service';
import { PaymentProcessingService } from './payment-processing.service';
import { RoutingRulesModule } from './routing-rules';

@NgModule({
    imports: [RoutingRulesModule],
    providers: [PaymentProcessingService, DomainStoreService, ClaimManagementService],
})
/**
 * @deprecated
 */
export class DamselModule {}
