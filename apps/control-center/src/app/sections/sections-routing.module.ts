import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { APP_ROUTES } from '../app-routes';

const ROUTES: Routes = [
    {
        path: 'domain',
        loadChildren: () => import('./domain').then((m) => m.DomainModule),
    },
    APP_ROUTES.domain2.root.getRoute(),
    {
        path: 'domain2',
        loadChildren: () => import('./domain2').then((m) => m.DomainModule),
    },
    {
        path: 'party',
        loadChildren: () => import('./party/party.module').then((m) => m.PartyModule),
    },
    {
        path: 'claims',
        loadChildren: () => import('./claims').then((m) => m.ClaimsModule),
    },
    {
        path: 'party/:partyID',
        children: [
            {
                path: 'claim/:claimID',
                loadChildren: () => import('./claim').then((m) => m.ClaimModule),
            },
            {
                path: 'invoice/:invoiceID/payment/:paymentID',
                loadChildren: () => import('./payment-details').then((m) => m.PaymentDetailsModule),
            },
        ],
    },
    {
        path: 'withdrawals',
        loadChildren: () =>
            import('./withdrawals/withdrawals.module').then((m) => m.WithdrawalsModule),
    },
    {
        path: 'machines',
        loadChildren: () => import('./machines/machines.module').then((m) => m.MachinesModule),
    },
    {
        path: 'payments',
        loadChildren: () => import('./payments/payments.module').then((m) => m.PaymentsModule),
    },
    {
        path: 'deposits',
        loadChildren: () => import('./deposits/deposits.module').then((m) => m.DepositsModule),
    },
    {
        path: 'sources',
        loadChildren: () => import('./sources/sources.module').then((m) => m.SourcesModule),
    },
    {
        path: 'wallets',
        loadChildren: () => import('./wallets/wallets.module').then((m) => m.WalletsModule),
    },
    {
        path: 'chargebacks',
        loadChildren: () => import('./chargebacks').then((m) => m.ChargebacksModule),
    },
    {
        path: 'terminals',
        loadChildren: () => import('./terminals').then((m) => m.TerminalsModule),
    },
    {
        path: 'shops',
        loadChildren: () => import('./shops').then((m) => m.ShopsModule),
    },
    {
        path: 'terms',
        loadChildren: () => import('./terms').then((m) => m.Terms),
    },
    {
        path: '404',
        loadChildren: () => import('./not-found').then((m) => m.NotFoundModule),
    },
    {
        path: '**',
        redirectTo: '/404',
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SectionsRoutingModule {}
