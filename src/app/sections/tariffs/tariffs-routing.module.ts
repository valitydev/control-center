import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { ShopsTariffsComponent } from './components/shops-tariffs/shops-tariffs.component';
import { TerminalsTermsComponent } from './components/terminals-terms/terminals-terms.component';
import { WalletsTariffsComponent } from './components/wallets-tariffs/wallets-tariffs.component';
import { ROUTING_CONFIG } from './routing-config';
import { TariffsComponent } from './tariffs.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: TariffsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: 'shops',
                        component: ShopsTariffsComponent,
                    },
                    {
                        path: 'wallets',
                        component: WalletsTariffsComponent,
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
export class TariffsRoutingModule {}
