import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import sortBy from 'lodash-es/sortBy';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG as CLAIMS_ROUTING_CONFIG } from './sections/claims/routing-config';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './sections/deposits/routing-config';
import { ROUTING_CONFIG as DOMAIN_ROUTING_CONFIG } from './sections/domain/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './sections/payments/routing-config';
import { ROUTING_CONFIG as PAYOUTS_ROUTING_CONFIG } from './sections/payouts/payouts/routing-config';
import { ROUTING_CONFIG as REPAIRING_ROUTING_CONFIG } from './sections/repairing/routing-config';
import { ROUTING_CONFIG as PARTIES_ROUTING_CONFIG } from './sections/search-parties/routing-config';
import { SHOPS_ROUTING_CONFIG } from './sections/shops';
import { ROUTING_CONFIG as SOURCES_ROUTING_CONFIG } from './sections/sources/routing-config';
import { ROUTING_CONFIG as TERMINALS_ROUTING_CONFIG } from './sections/terminals';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from './sections/wallets/routing-config';
import { ROUTING_CONFIG as WITHDRAWALS_ROUTING_CONFIG } from './sections/withdrawals/routing-config';
import { SidenavInfoService } from './shared/components/sidenav-info';

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    menuItems: { name: string; route: string }[][] = [];

    constructor(
        private keycloakService: KeycloakService,
        private appAuthGuardService: AppAuthGuardService,
        public sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnInit() {
        void this.keycloakService.loadUserProfile().then(() => {
            this.menuItems = this.getMenuItems();
        });
    }

    private getMenuItems() {
        const menuItems = [
            [
                {
                    name: 'Domain config',
                    route: '/domain',
                    services: DOMAIN_ROUTING_CONFIG.services,
                },
                {
                    name: 'Terminals',
                    route: '/terminals',
                    services: TERMINALS_ROUTING_CONFIG.services,
                },
                {
                    name: 'Repairing',
                    route: '/repairing',
                    services: REPAIRING_ROUTING_CONFIG.services,
                },
                {
                    name: 'Sources',
                    route: '/sources',
                    services: SOURCES_ROUTING_CONFIG.services,
                },
            ],
            [
                {
                    name: 'Merchants',
                    route: '/parties',
                    services: PARTIES_ROUTING_CONFIG.services,
                },
                {
                    name: 'Shops',
                    route: '/shops',
                    services: SHOPS_ROUTING_CONFIG.services,
                },
                {
                    name: 'Wallets',
                    route: '/wallets',
                    services: WALLETS_ROUTING_CONFIG.services,
                },
                {
                    name: 'Claims',
                    route: '/claims',
                    services: CLAIMS_ROUTING_CONFIG.services,
                },
            ],
            sortBy(
                [
                    {
                        name: 'Payments',
                        route: '/payments',
                        services: PAYMENTS_ROUTING_CONFIG.services,
                    },
                    {
                        name: 'Payouts',
                        route: '/payouts',
                        services: PAYOUTS_ROUTING_CONFIG.services,
                    },
                    {
                        name: 'Chargebacks',
                        route: '/chargebacks',
                        services: WALLETS_ROUTING_CONFIG.services,
                    },
                    {
                        name: 'Deposits',
                        route: '/deposits',
                        services: DEPOSITS_ROUTING_CONFIG.services,
                    },
                    {
                        name: 'Withdrawals',
                        route: '/withdrawals',
                        services: WITHDRAWALS_ROUTING_CONFIG.services,
                    },
                ],
                'name',
            ),
        ];
        return menuItems.map((group) =>
            group.filter((item) =>
                this.appAuthGuardService.userHasSomeServiceMethods(item.services),
            ),
        );
    }
}
