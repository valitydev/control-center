import { Component, inject } from '@angular/core';
import { BaseLink, CmdkService, Link, getUrlPath } from '@vality/matez';
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

function isHidden(services: Services[]): BaseLink['isHidden'] {
    const keycloakUserService = inject(KeycloakUserService);
    return !keycloakUserService.hasServiceRole(...services);
}

const createNavLinks = (): Link[] => [
    {
        children: [
            {
                label: 'Domain config',
                url: '/domain',
                isHidden: isHidden(APP_ROUTES.domain.root.config.services),
            },
            {
                label: 'Terminals',
                url: '/terminals',
                isHidden: isHidden(TERMINALS_ROUTING_CONFIG.services),
            },
            {
                label: 'Machines',
                url: '/machines',
                isHidden: isHidden(MACHINES_ROUTING_CONFIG.services),
            },
            {
                label: 'Sources',
                url: '/sources',
                isHidden: isHidden(SOURCES_ROUTING_CONFIG.services),
            },
            {
                label: 'Terms',
                url: '/terms',
                isHidden: isHidden(TERMS_ROUTING_CONFIG.services),
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
            (url) => ({
                label: 'Merchants',
                url: '/parties',
                isHidden: isHidden(APP_ROUTES.parties.root.config.services),
                children: [
                    {
                        label: 'Shops',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/shops`,
                        isHidden:
                            getUrlPath(url).length < 3 || isHidden(SHOPS_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Wallets',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/wallets`,
                        isHidden:
                            getUrlPath(url).length < 3 || isHidden(WALLETS_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Payment RR',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/routing-rules/payment/main`,
                        isHidden:
                            getUrlPath(url).length < 3 || isHidden(RULESET_ROUTING_CONFIG.services),
                    },
                    {
                        label: 'Withdrawal RR',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/routing-rules/withdrawal/main`,
                        isHidden:
                            getUrlPath(url).length < 3 || isHidden(RULESET_ROUTING_CONFIG.services),
                    },
                ],
            }),
            {
                label: 'Shops',
                url: '/shops',
                isHidden: isHidden(SHOPS_ROUTING_CONFIG.services),
            },
            {
                label: 'Wallets',
                url: '/wallets',
                isHidden: isHidden(WALLETS_ROUTING_CONFIG.services),
            },
        ],
    },
    {
        children: [
            (url) => ({
                label: 'Payments',
                url: '/payments',
                isHidden: isHidden(PAYMENTS_ROUTING_CONFIG.services),
                children: [
                    {
                        label: 'Details',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/details`,
                        isHidden: getUrlPath(url).length < 3,
                    },
                    {
                        label: 'Events',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/events`,
                        isHidden: getUrlPath(url).length < 3,
                    },
                    {
                        label: 'Refunds',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/refunds`,
                        isHidden: getUrlPath(url).length < 3,
                    },
                    {
                        label: 'Chargebacks',
                        url: `/${getUrlPath(url).slice(0, 2).join('/')}/chargebacks`,
                        isHidden: getUrlPath(url).length < 3,
                    },
                ],
            }),
            {
                label: 'Chargebacks',
                url: '/chargebacks',
                isHidden: isHidden(WALLETS_ROUTING_CONFIG.services),
            },
            {
                label: 'Deposits',
                url: '/deposits',
                isHidden: isHidden(DEPOSITS_ROUTING_CONFIG.services),
            },
            {
                label: 'Withdrawals',
                url: '/withdrawals',
                isHidden: isHidden(WITHDRAWALS_ROUTING_CONFIG.services),
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
    links = createNavLinks();
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
