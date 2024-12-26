import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { PartyShopsComponent } from './party-shops.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PartyShopsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class PartyShopsRoutingModule {}
