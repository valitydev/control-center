import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { canActivateAuthRole } from '~/services';

import { ROUTING_CONFIG } from './routing-config';
import { TerminalsComponent } from './terminals.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: TerminalsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class TerminalsRoutingModule {}
