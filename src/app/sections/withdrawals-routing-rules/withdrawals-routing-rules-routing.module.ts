import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WithdrawalsRoutingRulesComponent } from './withdrawals-routing-rules.component';

const ROUTES: Routes = [
    {
        path: '',
        component: WithdrawalsRoutingRulesComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class WithdrawalsRoutingRulesRoutingModule {}
