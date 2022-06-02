import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService, DomainConfigRole } from '@cc/app/shared/services';

import { PartyDelegateRulesetsComponent } from './party-delegate-rulesets.component';

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
                        data: {
                            roles: [DomainConfigRole.Checkout],
                        },
                    },
                    {
                        path: '',
                        loadChildren: () =>
                            import('../party-routing-ruleset').then(
                                (m) => m.PartyPaymentRoutingRulesetModule
                            ),
                    },
                    {
                        path: '',
                        loadChildren: () =>
                            import('../shop-payment-routing-ruleset').then(
                                (m) => m.ShopPaymentRoutingRulesetModule
                            ),
                    },
                ],
            },
        ]),
    ],
})
export class PartyDelegateRulesetsRoutingModule {}
