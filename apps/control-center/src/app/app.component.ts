import { Component, inject } from '@angular/core';
import { CmdkService, Link } from '@vality/matez';
import Keycloak from 'keycloak-js';

import { environment } from '../environments/environment';

import { APP_ROUTES } from './app-routes';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './sections/deposits/routing-config';
import { ROUTING_CONFIG as MACHINES_ROUTING_CONFIG } from './sections/machines/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './sections/payments/routing-config';
import { ROUTING_CONFIG as RULESET_ROUTING_CONFIG } from './sections/routing-rules/routing-ruleset/routing-config';
import { SHOPS_ROUTING_CONFIG } from './sections/shops';
import { ROUTING_CONFIG as SOURCES_ROUTING_CONFIG } from './sections/sources/routing-config';
import { ROUTING_CONFIG as TERMINALS_ROUTING_CONFIG } from './sections/terminals';
import { ROUTING_CONFIG as TERMS_ROUTING_CONFIG } from './sections/terms/routing-config';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from './sections/wallets/routing-config';
import { ROUTING_CONFIG as WITHDRAWALS_ROUTING_CONFIG } from './sections/withdrawals/routing-config';
import { SidenavInfoService } from './shared/components/sidenav-info';
import { KeycloakUserService, Services } from './shared/services';

function createIsHidden(services: Services[]) {
    return () => {
        const keycloakUserService = inject(KeycloakUserService);
        return !keycloakUserService.hasServiceRole(...services);
    };
}

const NAV_LINKS: Link[] = [
    {
        children: [
            {
                label: 'Domain config',
                url: '/domain',
                isHidden: createIsHidden(APP_ROUTES.domain.root.config.services),
            },
            {
                label: 'Terminals',
                url: '/terminals',
                isHidden: createIsHidden(TERMINALS_ROUTING_CONFIG.services),
            },
            {
                label: 'Machines',
                url: '/machines',
                isHidden: createIsHidden(MACHINES_ROUTING_CONFIG.services),
            },
            {
                label: 'Sources',
                url: '/sources',
                isHidden: createIsHidden(SOURCES_ROUTING_CONFIG.services),
            },
            {
                label: 'Terms',
                url: '/terms',
                isHidden: createIsHidden(TERMS_ROUTING_CONFIG.services),
                children: [
                    {
                        label: 'Shops',
                        url: '/terms/shops',
                    },
                    {
                        label: 'Wallets',
                        url: '/terms/wallets',
                    },
                    {
                        label: 'Terminals',
                        url: '/terms/terminals',
                    },
                ],
            },
        ],
    },
    {
        children: [
            {
                label: 'Merchants',
                url: '/parties',
                isHidden: createIsHidden(APP_ROUTES.parties.root.config.services),
                children: [
                    {
                        label: 'Shops',
                        url: 'shops',
                        isHidden: createIsHidden(SHOPS_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Wallets',
                        url: 'wallets',
                        isHidden: createIsHidden(WALLETS_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Payment RR',
                        url: 'routing-rules/payment/main',
                        isHidden: createIsHidden(RULESET_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Withdrawal RR',
                        url: 'routing-rules/withdrawal/main',
                        isHidden: createIsHidden(RULESET_ROUTING_CONFIG.services),
                    },
                ],
            },
            {
                label: 'Shops',
                url: '/shops',
                isHidden: createIsHidden(SHOPS_ROUTING_CONFIG.services),
            },
            {
                label: 'Wallets',
                url: '/wallets',
                isHidden: createIsHidden(WALLETS_ROUTING_CONFIG.services),
            },
        ],
    },
    {
        children: [
            {
                label: 'Payments',
                url: '/payments',
                isHidden: createIsHidden(PAYMENTS_ROUTING_CONFIG.services),
                children: [
                    { label: 'Payment', url: 'details' },
                    { label: 'Events', url: 'events' },
                    { label: 'Refunds', url: 'refunds' },
                    { label: 'Chargebacks', url: 'chargebacks' },
                ],
            },
            {
                label: 'Chargebacks',
                url: '/chargebacks',
                isHidden: createIsHidden(WALLETS_ROUTING_CONFIG.services),
            },
            {
                label: 'Deposits',
                url: '/deposits',
                isHidden: createIsHidden(DEPOSITS_ROUTING_CONFIG.services),
            },
            {
                label: 'Withdrawals',
                url: '/withdrawals',
                isHidden: createIsHidden(WITHDRAWALS_ROUTING_CONFIG.services),
            },
        ],
    },
];

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent {
    private keycloakService = inject(Keycloak);
    private keycloakUserService = inject(KeycloakUserService);

    sidenavInfoService = inject(SidenavInfoService);
    cmdkService = inject(CmdkService);

    searchKeys = [navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl', 'K'];
    links = NAV_LINKS;
    username = this.keycloakUserService.username;

    constructor() {
        this.registerConsoleUtils();
    }

    logout() {
        this.keycloakService.logout();
    }

    private registerConsoleUtils() {
        Object.assign(window as never as object, {
            ccSwitchLogging: () => {
                environment.logging = { requests: !environment.logging.requests };

                console.log(`Logging ${environment.logging.requests ? 'enabled' : 'disabled'}`);
            },
            ccGetMyRoles: () => {
                console.log(this.keycloakUserService.roles.sort().join('\n'));
            },
        });
    }
}
