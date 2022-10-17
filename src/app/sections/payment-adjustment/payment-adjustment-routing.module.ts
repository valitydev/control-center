import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PaymentAdjustmentComponent } from './payment-adjustment.component';
import { ROUTING_CONFIG } from './routing-config';

const ROUTES: Routes = [
    {
        path: 'payment-adjustment',
        component: PaymentAdjustmentComponent,
        canActivate: [AppAuthGuardService],
        data: ROUTING_CONFIG,
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class PaymentAdjustmentRoutingModule {}
