import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

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
                        canActivate: [AppAuthGuardService],
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
                        path: '',
                        loadChildren: () =>
                            import('../routing-ruleset').then((m) => m.RoutingRulesetModule),
                    },
                ],
            },
            {
                path: '',
                redirectTo: 'payments',
                pathMatch: 'prefix',
            },
        ]),
    ],
})
export class PartyDelegateRulesetsRoutingModule {}
