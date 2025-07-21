import { Component, inject } from '@angular/core';
import { BaseLink, CmdkService, Link, getUrlPath } from '@vality/matez';
import Keycloak from 'keycloak-js';

import { environment } from '../environments/environment';

import { APP_ROUTES } from './app-routes';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './sections/deposits/routing-config';
import { ROUTING_CONFIG as MACHINES_ROUTING_CONFIG } from './sections/machines/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './sections/payments/routing-config';
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
            (url) => {
                const urlPath = getUrlPath(url);
                const partyPath = '/' + urlPath.slice(0, 2).join('/');
                const isPartyPath = urlPath[0] === 'parties' && urlPath.length > 1;
                return {
                    label: 'Merchants',
                    url: '/parties',
                    isHidden: isHidden(APP_ROUTES.parties.root.config.services),
                    children: isPartyPath
                        ? [
                              {
                                  label: 'Shops',
                                  url: `${partyPath}/shops`,
                              },
                              {
                                  label: 'Wallets',
                                  url: `${partyPath}/wallets`,
                              },
                              {
                                  label: 'Payment RR',
                                  url: `${partyPath}/routing-rules/payment/main`,
                              },
                              {
                                  label: 'Withdrawal RR',
                                  url: `${partyPath}/routing-rules/withdrawal/main`,
                              },
                          ]
                        : [],
                };
            },
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
            (url) => {
                const urlPath = getUrlPath(url);
                const paymentPath = '/' + urlPath.slice(0, 2).join('/');
                const isPaymentPath = urlPath[0] === 'payments' && urlPath.length > 1;
                return {
                    label: 'Payments',
                    url: '/payments',
                    isHidden: isHidden(PAYMENTS_ROUTING_CONFIG.services),
                    children: isPaymentPath
                        ? [
                              {
                                  label: 'Details',
                                  url: `${paymentPath}/details`,
                              },
                              {
                                  label: 'Events',
                                  url: `${paymentPath}/events`,
                              },
                              {
                                  label: 'Refunds',
                                  url: `${paymentPath}/refunds`,
                              },
                              {
                                  label: 'Chargebacks',
                                  url: `${paymentPath}/chargebacks`,
                              },
                          ]
                        : [],
                };
            },
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
