import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG as DOMAIN_ROUTING_CONFIG } from './domain/routing-config';
import { ROUTING_CONFIG as OLD_REPAIRING_ROUTING_CONFIG } from './repairing/routing-config';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './sections/deposits/routing-config';
import { ROUTING_CONFIG as PAYOUTS_ROUTING_CONFIG } from './sections/payouts/payouts/routing-config';
import { ROUTING_CONFIG as REPAIRING_ROUTING_CONFIG } from './sections/repairing/routing-config';
import { ROUTING_CONFIG as CLAIMS_ROUTING_CONFIG } from './sections/search-claims/routing-config';
import { ROUTING_CONFIG as PARTIES_ROUTING_CONFIG } from './sections/search-parties/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './sections/search-payments/routing-config';
import { ROUTING_CONFIG as WITHDRAWALS_ROUTING_CONFIG } from './sections/withdrawals/routing-config';

const SIDENAV_OPENED_KEY = 'sidenav-opened';

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    username: string;
    menuItems: { name: string; route: string }[] = [];

    get opened(): boolean {
        return localStorage.getItem(SIDENAV_OPENED_KEY) === String(true);
    }
    set opened(opened: boolean) {
        localStorage.setItem(SIDENAV_OPENED_KEY, String(opened));
    }

    constructor(
        private keycloakService: KeycloakService,
        private appAuthGuardService: AppAuthGuardService
    ) {}

    ngOnInit() {
        void this.keycloakService.loadUserProfile().then(() => {
            this.username = this.keycloakService.getUsername();
            this.menuItems = this.getMenuItems();
        });
    }

    logout() {
        void this.keycloakService.logout();
    }

    private getMenuItems() {
        const menuItems = [
            {
                name: 'Domain config',
                route: '/domain',
                services: DOMAIN_ROUTING_CONFIG.services,
            },
            {
                name: 'Payouts',
                route: '/payouts',
                services: PAYOUTS_ROUTING_CONFIG.services,
            },
            {
                name: 'Claims',
                route: '/claims',
                services: CLAIMS_ROUTING_CONFIG.services,
            },
            {
                name: 'Merchants',
                route: '/parties',
                services: PARTIES_ROUTING_CONFIG.services,
            },
            {
                name: 'Repairing',
                route: '/old-repairing',
                services: OLD_REPAIRING_ROUTING_CONFIG.services,
            },
            {
                name: 'New repairing',
                route: '/repairing',
                services: REPAIRING_ROUTING_CONFIG.services,
            },
            {
                name: 'Payments',
                route: '/payments',
                services: PAYMENTS_ROUTING_CONFIG.services,
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
        ];
        return menuItems.filter((item) =>
            this.appAuthGuardService.userHasSomeServiceMethods(item.services)
        );
    }
}
