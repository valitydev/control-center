import { Component, inject } from '@angular/core';
import { Link } from '@vality/matez';
import { KeycloakService } from 'keycloak-angular';
import sortBy from 'lodash-es/sortBy';
import { Observable, from } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { environment } from '../environments/environment';

import { ROUTING_CONFIG as CLAIMS_ROUTING_CONFIG } from './sections/claims/routing-config';
import { ROUTING_CONFIG as DEPOSITS_ROUTING_CONFIG } from './sections/deposits/routing-config';
import { ROUTING_CONFIG as DOMAIN_ROUTING_CONFIG } from './sections/domain2/routing-config';
import { ROUTING_CONFIG as MACHINES_ROUTING_CONFIG } from './sections/machines/routing-config';
import { ROUTING_CONFIG as PAYMENTS_ROUTING_CONFIG } from './sections/payments/routing-config';
import { ROUTING_CONFIG as PARTIES_ROUTING_CONFIG } from './sections/search-parties/routing-config';
import { SHOPS_ROUTING_CONFIG } from './sections/shops';
import { ROUTING_CONFIG as SOURCES_ROUTING_CONFIG } from './sections/sources/routing-config';
import { ROUTING_CONFIG as TERMINALS_ROUTING_CONFIG } from './sections/terminals';
import { ROUTING_CONFIG as TERMS_ROUTING_CONFIG } from './sections/terms/routing-config';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from './sections/wallets/routing-config';
import { ROUTING_CONFIG as WITHDRAWALS_ROUTING_CONFIG } from './sections/withdrawals/routing-config';
import { SidenavInfoService } from './shared/components/sidenav-info';
import { AppAuthGuardService, Services } from './shared/services';

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent {
    private keycloakService = inject(KeycloakService);
    private appAuthGuardService = inject(AppAuthGuardService);
    public sidenavInfoService = inject(SidenavInfoService);
    links$: Observable<Link[][]> = from(this.keycloakService.loadUserProfile()).pipe(
        startWith(null),
        map(() => this.getMenuItemsGroups()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor() {
        this.registerConsoleUtils();
    }

    private registerConsoleUtils() {
        Object.assign(window as never as object, {
            ccSwitchLogging: () => {
                environment.logging = { requests: !environment.logging.requests };

                console.log(`Logging ${environment.logging.requests ? 'enabled' : 'disabled'}`);
            },
            ccGetMyRoles: () => {
                console.log(this.keycloakService.getUserRoles(true).sort().join('\n'));
            },
        });
    }

    private getMenuItemsGroups() {
        const menuItems: (Link & { services: Services[] })[][] = [
            [
                {
                    label: 'Domain config',
                    url: '/domain',
                    services: DOMAIN_ROUTING_CONFIG.services,
                },
                {
                    label: 'Terminals',
                    url: '/terminals',
                    services: TERMINALS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Machines',
                    url: '/machines',
                    services: MACHINES_ROUTING_CONFIG.services,
                },
                {
                    label: 'Sources',
                    url: '/sources',
                    services: SOURCES_ROUTING_CONFIG.services,
                },
                {
                    label: 'Terms',
                    url: '/terms',
                    services: TERMS_ROUTING_CONFIG.services,
                },
            ],
            [
                {
                    label: 'Merchants',
                    url: '/parties',
                    services: PARTIES_ROUTING_CONFIG.services,
                },
                {
                    label: 'Shops',
                    url: '/shops',
                    services: SHOPS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Wallets',
                    url: '/wallets',
                    services: WALLETS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Claims',
                    url: '/claims',
                    services: CLAIMS_ROUTING_CONFIG.services,
                },
            ],
            [
                {
                    label: 'Payments',
                    url: '/payments',
                    services: PAYMENTS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Chargebacks',
                    url: '/chargebacks',
                    services: WALLETS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Deposits',
                    url: '/deposits',
                    services: DEPOSITS_ROUTING_CONFIG.services,
                },
                {
                    label: 'Withdrawals',
                    url: '/withdrawals',
                    services: WITHDRAWALS_ROUTING_CONFIG.services,
                },
            ],
        ];
        return menuItems
            .map((group) =>
                group.filter((item) =>
                    this.appAuthGuardService.userHasSomeServiceMethods(item.services),
                ),
            )
            .map((group) => sortBy(group, 'label'));
    }
}
