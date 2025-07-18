import { Component, inject } from '@angular/core';
import { Link } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { KeycloakUserService, Services } from '../../shared/services';
import { ROUTING_CONFIG as RULESET_ROUTING_CONFIG } from '../routing-rules/party-routing-ruleset/routing-config';
import { SHOPS_ROUTING_CONFIG } from '../shops';
import { ROUTING_CONFIG as WALLETS_ROUTING_CONFIG } from '../wallets/routing-config';

import { PartyStoreService } from './party-store.service';

interface PartyLink extends Link {
    services?: Services[];
}

@Component({
    templateUrl: 'party.component.html',
    providers: [PartyStoreService],
    standalone: false,
})
export class PartyComponent {
    private userService = inject(KeycloakUserService);
    protected sidenavInfoService = inject(SidenavInfoService);
    private partyStoreService = inject(PartyStoreService);
    links: PartyLink[] = [
        {
            label: 'Shops',
            url: 'shops',
            services: SHOPS_ROUTING_CONFIG.services,
        },
        {
            label: 'Wallets',
            url: 'wallets',
            services: WALLETS_ROUTING_CONFIG.services,
        },
        {
            label: 'Payment Routing Rules',
            url: 'routing-rules/payment/main',
            services: RULESET_ROUTING_CONFIG.services,
        },
        {
            label: 'Withdrawal Routing Rules',
            url: 'routing-rules/withdrawal/main',
            services: RULESET_ROUTING_CONFIG.services,
        },
    ].filter((item) => this.userService.hasServiceRole(...item.services));
    party$ = this.partyStoreService.party$;
    tags$ = this.party$.pipe(
        map((party) => [
            ...(party?.blocking
                ? [
                      {
                          value: startCase(getUnionKey(party.blocking)),
                          color: getUnionKey(party.blocking) === 'blocked' ? 'warn' : 'success',
                      },
                  ]
                : []),
            ...(party?.suspension
                ? [
                      {
                          value: startCase(getUnionKey(party.suspension)),
                          color: getUnionKey(party.suspension) === 'suspended' ? 'warn' : 'success',
                      },
                  ]
                : []),
        ]),
    );
}
