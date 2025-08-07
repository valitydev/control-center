import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '../../shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { WalletsComponent } from './wallets.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: WalletsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class WalletsRoutingModule {}
