import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { canActivateAuthRole } from '~/services';

import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from '../../wallets/routing-config';

import { PartyComponent } from './party.component';
import { ROUTING_CONFIG } from './routing-config';
import { ROUTING_CONFIG as WALLET_WEBHOOKS_ROUTING_CONFIG } from './wallet-webhooks/routing-config';
import { ROUTING_CONFIG as WEBHOOKS_ROUTING_CONFIG } from './webhooks/routing-config';

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
                        loadChildren: () => import('./shops').then((m) => m.PartyShopsModule),
                    },
                    {
                        path: 'routing-rules',
                        loadChildren: () =>
                            import('./routing-rules').then((m) => m.RoutingRulesModule),
                    },
                    {
                        path: 'wallets',
                        loadComponent: () =>
                            import('../../wallets/wallets.component').then(
                                (m) => m.WalletsComponent,
                            ),
                        canActivate: [canActivateAuthRole],
                        data: WALLETS_ROUTING_CONFIG,
                    },
                    {
                        path: 'shop-webhooks',
                        loadComponent: () => import('./webhooks').then((m) => m.WebhooksComponent),
                        canActivate: [canActivateAuthRole],
                        data: WEBHOOKS_ROUTING_CONFIG,
                    },
                    {
                        path: 'shop-webhooks/:webhookID',
                        loadComponent: () =>
                            import('./webhooks/webhook/webhook.component').then(
                                (m) => m.WebhookComponent,
                            ),
                        canActivate: [canActivateAuthRole],
                        data: WEBHOOKS_ROUTING_CONFIG,
                    },
                    {
                        path: 'wallet-webhooks',
                        loadComponent: () =>
                            import('./wallet-webhooks').then((m) => m.WalletWebhooksComponent),
                        canActivate: [canActivateAuthRole],
                        data: WALLET_WEBHOOKS_ROUTING_CONFIG,
                    },
                    {
                        path: 'wallet-webhooks/:webhookID',
                        loadComponent: () =>
                            import(
                                './wallet-webhooks/wallet-webhook/wallet-webhook.component'
                            ).then((m) => m.WalletWebhookComponent),
                        canActivate: [canActivateAuthRole],
                        data: WALLET_WEBHOOKS_ROUTING_CONFIG,
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
