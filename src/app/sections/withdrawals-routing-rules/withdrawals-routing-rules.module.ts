import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WithdrawalsRoutingRulesRoutingModule } from './withdrawals-routing-rules-routing.module';
import { WithdrawalsRoutingRulesComponent } from './withdrawals-routing-rules.component';

@NgModule({
    declarations: [WithdrawalsRoutingRulesComponent],
    imports: [CommonModule, WithdrawalsRoutingRulesRoutingModule],
})
export class WithdrawalsRoutingRulesModule {}
