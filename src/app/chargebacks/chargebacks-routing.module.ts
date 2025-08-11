import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ChargebacksComponent } from './chargebacks.component';
import { ROUTING_CONFIG } from './routing-config';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ChargebacksComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class ChargebacksRoutingModule {}
