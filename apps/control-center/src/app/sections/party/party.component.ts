import { Component } from '@angular/core';
import { Link } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { AppAuthGuardService, Services } from '@cc/app/shared/services';

import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { ROUTING_CONFIG as CLAIMS_CONFIG } from '../claims/routing-config';
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
})
export class PartyComponent {
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
            label: 'Claims',
            url: 'claims',
            services: CLAIMS_CONFIG.services,
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
    ].filter((item) => this.appAuthGuardService.userHasSomeServiceMethods(item.services));
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

    constructor(
        private appAuthGuardService: AppAuthGuardService,
        protected sidenavInfoService: SidenavInfoService,
        private partyStoreService: PartyStoreService,
    ) {}
}
