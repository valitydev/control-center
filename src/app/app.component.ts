import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { Repository } from '@vality/domain-proto/domain_config_v2';
import {
    BaseLink,
    CmdkModule,
    CmdkOption,
    Link,
    NavComponent,
    ThemeService,
    getUrlPath,
} from '@vality/matez';
import Keycloak from 'keycloak-js';
import { debounceTime, map, of, shareReplay, switchMap, tap } from 'rxjs';


import { APP_ROUTES } from './app-routes';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './deposits/routing-config';
import { ROUTING_CONFIG as MACHINES_ROUTING_CONFIG } from './machines/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './payments/routing-config';
import { SidenavInfoModule, SidenavInfoService } from './shared/components/sidenav-info';
import { getLimitedDomainObjectDetails } from './shared/components/thrift-api-crud';
import { DomainObjectCardComponent } from './shared/components/thrift-api-crud/domain';
import { SHOPS_ROUTING_CONFIG } from './shops';
import { ROUTING_CONFIG as SOURCES_ROUTING_CONFIG } from './sources/routing-config';
import { ROUTING_CONFIG as TERMINALS_ROUTING_CONFIG } from './terminals';
import { ROUTING_CONFIG as TERMS_ROUTING_CONFIG } from './terms/routing-config';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from './wallets/routing-config';
import { ROUTING_CONFIG as WITHDRAWALS_ROUTING_CONFIG } from './withdrawals/routing-config';

import { KeycloakUserService, Services } from '~/services';
import { LOGGING } from '~/utils';

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
                    label: isPartyPath ? 'Party' : 'Parties',
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
                                  checkUrl: `${partyPath}/routing-rules/payment`,
                              },
                              {
                                  label: 'Withdrawal RR',
                                  url: `${partyPath}/routing-rules/withdrawal/main`,
                                  checkUrl: `${partyPath}/routing-rules/withdrawal`,
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
                    label: isPaymentPath ? 'Payment' : 'Payments',
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
    imports: [
        MatSidenavModule,
        MatIconModule,
        CmdkModule,
        CommonModule,
        NavComponent,
        MatMenuModule,
        MatToolbarModule,
        RouterOutlet,
        SidenavInfoModule,
        MatButtonModule,
        MatTooltipModule,
    ],
})
export class AppComponent {
    private keycloakService = inject(Keycloak);
    private keycloakUserService = inject(KeycloakUserService);
    private repositoryService = inject(Repository);
    private router = inject(Router);
    private dr = inject(DestroyRef);

    sidenavInfoService = inject(SidenavInfoService);
    themeService = inject(ThemeService);

    links = createNavLinks();
    username = this.keycloakUserService.username;
    search = signal<string>('');
    searchProgress = signal<boolean>(false);
    options$ = toObservable(this.search).pipe(
        tap(() => this.searchProgress.set(true)),
        debounceTime(300),
        switchMap((searchStr) =>
            searchStr
                ? this.repositoryService.SearchObjects({ query: searchStr, limit: 25 }).pipe(
                      map((objects): CmdkOption[] =>
                          objects.result.map((obj) => {
                              const details = getLimitedDomainObjectDetails(obj);
                              return {
                                  label: details.label,
                                  description: details.description,
                                  tooltip: `${details.id} (${details.type})`,
                                  action: async () => {
                                      await this.router.navigate(['/domain']);
                                      this.sidenavInfoService.open(DomainObjectCardComponent, {
                                          ref: obj.ref,
                                      });
                                  },
                              };
                          }),
                      ),
                  )
                : of([]),
        ),
        tap(() => this.searchProgress.set(false)),
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );

    constructor() {
        this.registerConsoleUtils();
    }

    logout() {
        this.keycloakService.logout();
    }

    getThemeIcon(theme = this.themeService.theme()) {
        switch (theme) {
            case 'light':
                return 'light_mode';
            case 'dark':
                return 'dark_mode';
            case 'system':
                return 'routine';
        }
    }

    private registerConsoleUtils() {
        Object.assign(window as never as object, {
            ccSwitchLogging: () => {
                LOGGING.fullLogging = !LOGGING.fullLogging;
                console.log(`Logging ${LOGGING.fullLogging ? 'enabled' : 'disabled'}`);
            },
            ccGetMyRoles: () => {
                console.log(this.keycloakUserService.roles.sort().join('\n'));
            },
        });
    }
}
