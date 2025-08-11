import { Routes } from '@angular/router';

import { canActivateAuthRole } from '../services';

import { APP_ROUTES } from './app-routes';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from './wallets/routing-config';

export const routes: Routes = [
    APP_ROUTES.domain.root.getRoute(),
    APP_ROUTES.parties.root.getRoute(),
    {
        path: 'parties',
        loadChildren: () => import('./parties/party/party.module').then((m) => m.PartyModule),
    },
    {
        path: 'withdrawals',
        loadChildren: () =>
            import('./sections/withdrawals/withdrawals.module').then((m) => m.WithdrawalsModule),
    },
    {
        path: 'machines',
        loadChildren: () =>
            import('./sections/machines/machines.module').then((m) => m.MachinesModule),
    },
    {
        path: 'payments',
        loadChildren: () => import('./payments/payments.module').then((m) => m.PaymentsModule),
    },
    {
        path: 'deposits',
        loadChildren: () =>
            import('./sections/deposits/deposits.module').then((m) => m.DepositsModule),
    },
    {
        path: 'sources',
        loadChildren: () =>
            import('./sections/sources/sources.module').then((m) => m.SourcesModule),
    },
    {
        path: 'wallets',
        loadComponent: () => import('./wallets/wallets.component').then((m) => m.WalletsComponent),
        canActivate: [canActivateAuthRole],
        data: WALLETS_ROUTING_CONFIG,
    },
    {
        path: 'chargebacks',
        loadChildren: () => import('./sections/chargebacks').then((m) => m.ChargebacksModule),
    },
    {
        path: 'terminals',
        loadChildren: () => import('./sections/terminals').then((m) => m.TerminalsModule),
    },
    {
        path: 'shops',
        loadChildren: () => import('./shops').then((m) => m.ShopsModule),
    },
    {
        path: 'terms',
        loadChildren: () => import('./sections/terms').then((m) => m.Terms),
    },
    {
        path: '404',
        loadChildren: () => import('./not-found').then((m) => m.NotFoundModule),
    },
    {
        path: '',
        redirectTo: '/domain',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: '/404',
    },
];
