import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { DepositDetailsComponent } from './deposit-details.component';
import { ROUTING_CONFIG } from './routing-config';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: DepositDetailsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class DepositDetailsRoutingModule {}
