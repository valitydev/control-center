import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PaymentDetailsComponent } from './payment-details.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PaymentDetailsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: 'details',
                        loadComponent: () =>
                            import('./components/payment-details/payment-details.component').then(
                                (m) => m.PaymentDetailsComponent,
                            ),
                    },
                    {
                        path: 'chargebacks',
                        loadComponent: () =>
                            import(
                                './components/payment-chargebacks/payment-chargebacks.component'
                            ).then((m) => m.PaymentChargebacksComponent),
                    },
                    {
                        path: 'refunds',
                        loadComponent: () =>
                            import('./components/payment-refunds/payment-refunds.component').then(
                                (m) => m.PaymentRefundsComponent,
                            ),
                    },
                    {
                        path: '',
                        redirectTo: 'details',
                        pathMatch: 'full',
                    },
                ],
            },
        ]),
    ],
})
export class PaymentDetailsRoutingModule {}
