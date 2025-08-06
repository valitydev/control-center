import { Routes } from '@angular/router';

import { APP_ROUTES } from './app-routes';

export const routes: Routes = [
    APP_ROUTES.domain.root.getRoute(),
    APP_ROUTES.parties.root.getRoute(),
    {
        path: 'parties',
        loadChildren: () => import('./sections/party/party.module').then((m) => m.PartyModule),
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
        loadChildren: () =>
            import('./sections/payments/payments.module').then((m) => m.PaymentsModule),
    },
    {
        path: 'payments/:paymentID',
        loadChildren: () =>
            import('./sections/payment-details').then((m) => m.PaymentDetailsModule),
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
        loadChildren: () =>
            import('./sections/wallets/wallets.module').then((m) => m.WalletsModule),
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
        loadChildren: () => import('./sections/shops').then((m) => m.ShopsModule),
    },
    {
        path: 'terms',
        loadChildren: () => import('./sections/terms').then((m) => m.Terms),
    },
    {
        path: '404',
        loadChildren: () => import('./sections/not-found').then((m) => m.NotFoundModule),
    },
    {
        path: '**',
        redirectTo: '/404',
    },
    {
        path: '',
        redirectTo: '/domain',
        pathMatch: 'full',
    },
];
