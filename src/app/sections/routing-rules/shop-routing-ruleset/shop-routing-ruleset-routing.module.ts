import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService, DomainConfigRole } from '@cc/app/shared/services';

import { ShopRoutingRulesetComponent } from './shop-routing-ruleset.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':partyRefID/shop-ruleset/:refID',
                component: ShopRoutingRulesetComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [DomainConfigRole.Checkout],
                },
            },
        ]),
    ],
})
export class ShopRoutingRulesetRoutingModule {}
