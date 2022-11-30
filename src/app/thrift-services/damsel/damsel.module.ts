import { NgModule } from '@angular/core';

import { PaymentProcessingService } from './payment-processing.service';
import { RoutingRulesModule } from './routing-rules';

@NgModule({
    imports: [RoutingRulesModule],
    providers: [PaymentProcessingService],
})
/**
 * @deprecated
 */
export class DamselModule {}
