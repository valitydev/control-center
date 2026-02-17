import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Service, canActivateAuthRole } from '~/services';

import { CandidatesComponent } from '../candidates';

import { PartyDelegateRulesetsComponent } from './party-delegate-rulesets.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':type',
                children: [
                    {
                        path: '',
                        component: PartyDelegateRulesetsComponent,
                        canActivate: [canActivateAuthRole],
                        data: ROUTING_CONFIG,
                    },
                    {
                        path: '',
                        loadChildren: () =>
                            import('../party-routing-ruleset').then(
                                (m) => m.PartyRoutingRulesetModule,
                            ),
                    },
                    {
                        path: ':partyRefID/delegate/:refID',
                        component: CandidatesComponent,
                        canActivate: [canActivateAuthRole],
                        data: { services: [Service.DMT] },
                    },
                ],
            },
            {
                path: '',
                redirectTo: 'payment',
                pathMatch: 'prefix',
            },
        ]),
    ],
})
export class PartyDelegateRulesetsRoutingModule {}
