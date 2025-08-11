import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '~/services';

import { DepositsComponent } from './deposits.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: DepositsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
            {
                path: ':depositID',
                loadChildren: () => import('./deposit').then((m) => m.DepositDetailsModule),
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DepositsRoutingModule {}
