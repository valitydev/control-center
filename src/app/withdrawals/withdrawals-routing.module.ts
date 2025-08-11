import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ROUTING_CONFIG } from './routing-config';
import { WithdrawalsComponent } from './withdrawals.component';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: WithdrawalsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class WithdrawalsRoutingModule {}
