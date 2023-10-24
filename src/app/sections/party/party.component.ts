import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NotifyLogService } from '@vality/ng-core';
import { EMPTY } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PartyManagementService } from '../../api/payment-processing';
import { ROUTING_CONFIG as SHOPS_ROUTING_CONFIG } from '../party-shops/routing-config';
import { ROUTING_CONFIG as RULESET_ROUTING_CONFIG } from '../routing-rules/party-routing-ruleset/routing-config';

@Component({
    templateUrl: 'party.component.html',
    styleUrls: ['party.component.scss'],
})
export class PartyComponent {
    links = this.getLinks();
    activeLinkByFragment$ = this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        startWith(undefined),
        map(() => this.findLinkWithMaxActiveFragments()),
        shareReplay(1),
    );
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
        private router: Router,
        private appAuthGuardService: AppAuthGuardService,
        private partyManagementService: PartyManagementService,
        private log: NotifyLogService,
    ) {}

    private getLinks() {
        const links = [
            {
                name: 'Shops',
                url: 'shops',
                otherActiveUrlFragments: ['shop'],
                services: SHOPS_ROUTING_CONFIG.services,
            },
            {
                name: 'Payment Routing Rules',
                url: 'routing-rules/payment',
                services: RULESET_ROUTING_CONFIG.services,
            },
            {
                name: 'Withdrawal Routing Rules',
                url: 'routing-rules/withdrawal',
                services: RULESET_ROUTING_CONFIG.services,
            },
        ];
        return links.filter((item) =>
            this.appAuthGuardService.userHasSomeServiceMethods(item.services),
        );
    }

    private activeFragments(fragments: string[]): number {
        if (fragments?.length) {
            const ulrFragments = this.router.url.split('/');
            if (
                ulrFragments.filter((fragment) => fragments.includes(fragment)).length ===
                fragments.length
            ) {
                return fragments.length;
            }
        }
        return 0;
    }

    private findLinkWithMaxActiveFragments() {
        return this.links.reduce(([maxLink, maxActiveFragments], link) => {
            const activeFragments = this.activeFragments(link.otherActiveUrlFragments);
            return maxActiveFragments > activeFragments
                ? [maxLink, maxActiveFragments]
                : [link, activeFragments];
        }, [])?.[0];
    }
}
