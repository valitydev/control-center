import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PartyComponent } from './party.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: ':partyID',
                component: PartyComponent,
                canActivate: [AppAuthGuardService],
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
                        path: 'claims',
                        loadChildren: () => import('../claims').then((m) => m.ClaimsModule),
                    },
                    {
                        path: 'claim',
                        redirectTo: 'claims',
                    },
                    { path: '', redirectTo: 'shops', pathMatch: 'full' },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PartyRouting {}
