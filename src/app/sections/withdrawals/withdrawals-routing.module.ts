import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '../../shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { WithdrawalsComponent } from './withdrawals.component';

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
