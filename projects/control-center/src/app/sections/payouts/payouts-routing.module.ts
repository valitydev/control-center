import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'payouts',
                loadChildren: () => import('./payouts/payouts.module').then((m) => m.PayoutsModule),
            },
            {
                path: 'payouts/:payoutId',
                loadChildren: () =>
                    import('./payout-details/payout-details.module').then(
                        (m) => m.PayoutDetailsModule
                    ),
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PayoutsRoutingModule {}
