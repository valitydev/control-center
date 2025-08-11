import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '../../services';

import { PaymentsComponent } from './payments.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PaymentsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: ':paymentID',
                        loadChildren: () => import('./payment').then((m) => m.PaymentDetailsModule),
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PaymentsRoutingModule {}
