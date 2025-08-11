import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ROUTING_CONFIG } from './routing-config';
import { RoutingRulesetComponent } from './routing-ruleset.component';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':partyRefID/delegate/:refID',
                component: RoutingRulesetComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class RoutingRulesetRoutingModule {}
