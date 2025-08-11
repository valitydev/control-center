import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ShopsTermsComponent } from './components/shops-terms/shops-terms.component';
import { TerminalsTermsComponent } from './components/terminals-terms/terminals-terms.component';
import { WalletsTermsComponent } from './components/wallets-terms/wallets-terms.component';
import { ROUTING_CONFIG } from './routing-config';
import { TermsComponent } from './terms.component';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: TermsComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: 'shops',
                        component: ShopsTermsComponent,
                    },
                    {
                        path: 'wallets',
                        component: WalletsTermsComponent,
                    },
                    {
                        path: 'terminals',
                        component: TerminalsTermsComponent,
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
export class TermsRoutingModule {}
