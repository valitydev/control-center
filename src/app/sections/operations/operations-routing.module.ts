import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OperationsComponent } from './operations.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'operations',
                component: OperationsComponent,
                children: [
                    {
                        path: 'payments',
                        loadChildren: () =>
                            import('../search-payments').then((m) => m.SearchPaymentsModule),
                    },
                    {
                        path: 'deposits',
                        loadChildren: () => import('../deposits').then((m) => m.DepositsModule),
                    },
                    {
                        path: 'deposit/:depositID',
                        loadChildren: () =>
                            import('../deposit-details').then((m) => m.DepositDetailsModule),
                    },
                    {
                        path: '',
                        redirectTo: 'payments',
                        pathMatch: 'full',
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class OperationsRoutingModule {}
