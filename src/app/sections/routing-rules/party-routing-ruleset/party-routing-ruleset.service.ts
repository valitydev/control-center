import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, defer, Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';

import { RoutingRulesService } from '../../../thrift-services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';

@Injectable()
export class PartyRoutingRulesetService {
    partyID$ = this.route.params.pipe(pluck('partyID'), shareReplay(1)) as Observable<string>;
    refID$ = this.route.params.pipe(
        pluck('partyRefID'),
        map((r) => +r),
        shareReplay(1)
    );

    shops$ = defer(() => this.party$).pipe(
        pluck('shops'),
        map((shops) => Array.from(shops.values()))
    );

    partyRuleset$ = combineLatest([this.routingRulesService.rulesets$, this.refID$]).pipe(
        map(([rules, refID]) => rules.find((r) => r?.ref?.id === refID)),
        shareReplay(1)
    );

    private party$ = this.partyID$.pipe(
        switchMap((partyID) => this.partyManagementWithUserService.getParty(partyID)),
        shareReplay(1)
    );

    constructor(
        private route: ActivatedRoute,
        private partyManagementWithUserService: PartyManagementWithUserService,
        private domainStoreService: DomainStoreService,
        private routingRulesService: RoutingRulesService
    ) {}

    reload() {
        this.routingRulesService.reload();
    }
}
