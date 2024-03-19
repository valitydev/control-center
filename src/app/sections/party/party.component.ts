import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotifyLogService, Link } from '@vality/ng-core';
import { EMPTY } from 'rxjs';
import { catchError, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { AppAuthGuardService, Services } from '@cc/app/shared/services';

import { PartyManagementService } from '../../api/payment-processing';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { ROUTING_CONFIG as SHOPS_ROUTING_CONFIG } from '../party-shops/routing-config';
import { ROUTING_CONFIG as RULESET_ROUTING_CONFIG } from '../routing-rules/party-routing-ruleset/routing-config';

interface PartyLink extends Link {
    services?: Services[];
}

@Component({
    templateUrl: 'party.component.html',
})
export class PartyComponent {
    links: PartyLink[] = [
        {
            label: 'Shops',
            url: 'shops',
            services: SHOPS_ROUTING_CONFIG.services,
        },
        {
            label: 'Payment Routing Rules',
            url: 'routing-rules/payment',
            services: RULESET_ROUTING_CONFIG.services,
        },
        {
            label: 'Withdrawal Routing Rules',
            url: 'routing-rules/withdrawal',
            services: RULESET_ROUTING_CONFIG.services,
        },
    ].filter((item) => this.appAuthGuardService.userHasSomeServiceMethods(item.services));
    party$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        switchMap(({ partyID }) => this.partyManagementService.Get(partyID)),
        catchError((err) => {
            this.log.error(err);
            return EMPTY;
        }),
        startWith({ id: this.route.snapshot.params.partyID }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private route: ActivatedRoute,
        private appAuthGuardService: AppAuthGuardService,
        private partyManagementService: PartyManagementService,
        private log: NotifyLogService,
        protected sidenavInfoService: SidenavInfoService,
    ) {}
}
