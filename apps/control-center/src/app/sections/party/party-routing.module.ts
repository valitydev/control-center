import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '../../shared/services';

import { PartyComponent } from './party.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':partyID',
                component: PartyComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: 'shops',
                        loadChildren: () =>
                            import('../party-shops').then((m) => m.PartyShopsModule),
                    },
                    {
                        path: 'routing-rules',
                        loadChildren: () =>
                            import('../routing-rules').then((m) => m.RoutingRulesModule),
                    },
                    {
                        path: 'wallets',
                        loadChildren: () =>
                            import('../wallets/wallets.module').then((m) => m.WalletsModule),
                    },
                    {
                        path: 'wallet',
                        redirectTo: 'wallets',
                    },
                    {
                        path: '',
                        redirectTo: 'shops',
                        pathMatch: 'full',
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PartyRouting {}
