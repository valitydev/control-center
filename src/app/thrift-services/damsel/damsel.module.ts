import { NgModule } from '@angular/core';

import { ClaimManagementService } from './claim-management.service';
import { DomainStoreService } from './domain-store.service';
import { DomainService } from './domain.service';
import { MerchantStatisticsService } from './merchant-statistics.service';
import { PaymentProcessingService } from './payment-processing.service';
import { RoutingRulesModule } from './routing-rules';

@NgModule({
    imports: [RoutingRulesModule],
    providers: [
        DomainService,
        PaymentProcessingService,
        MerchantStatisticsService,
        DomainStoreService,
        ClaimManagementService,
    ],
})
export class DamselModule {}
