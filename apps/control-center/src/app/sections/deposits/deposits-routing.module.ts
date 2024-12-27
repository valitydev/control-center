import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { DepositsComponent } from './deposits.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: DepositsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
            {
                path: ':depositID',
                loadChildren: () =>
                    import('../deposit-details').then((m) => m.DepositDetailsModule),
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DepositsRoutingModule {}
