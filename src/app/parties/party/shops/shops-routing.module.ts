import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ROUTING_CONFIG } from './routing-config';
import { PartyShopsComponent } from './shops.component';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PartyShopsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class PartyShopsRoutingModule {}
