import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { PartyRoutingRulesetComponent } from './party-routing-ruleset.component';
import { ROUTING_CONFIG } from './routing-config';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':partyRefID',
                component: PartyRoutingRulesetComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class PartyRoutingRulesetRoutingModule {}
