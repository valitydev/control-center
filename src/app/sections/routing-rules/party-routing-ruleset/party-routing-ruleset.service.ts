import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { createDsl, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { PartyManagementService } from '@cc/app/api/payment-processing';

import { RoutingRulesService } from '../../../thrift-services/deprecated-damsel';
import { DomainStoreService } from '../../../thrift-services/deprecated-damsel/domain-store.service';

@UntilDestroy()
@Injectable()
export class PartyRoutingRulesetService {
    partyID$ = this.route.params.pipe(
        pluck('partyID'),
        untilDestroyed(this),
        shareReplay(1)
    ) as Observable<string>;
    refID$ = this.route.params.pipe(
        pluck('partyRefID'),
        map((r) => +r),
        untilDestroyed(this),
        shareReplay(1)
    );

    shops$ = defer(() => this.party$).pipe(
        pluck('shops'),
        map((shops) => Array.from(shops.values()))
    );
    wallets$ = defer(() => this.partyID$).pipe(
        switchMap((partyID) =>
            this.fistfulStatistics.GetWallets({
                dsl: createDsl({ wallets: { party_id: partyID } }),
            })
        ),
        pluck('data', 'wallets'),
        untilDestroyed(this),
        shareReplay(1)
    );

    partyRuleset$ = combineLatest([this.routingRulesService.rulesets$, this.refID$]).pipe(
        map(([rules, refID]) => rules.find((r) => r?.ref?.id === refID)),
        untilDestroyed(this),
        shareReplay(1)
    );

    private party$ = this.partyID$.pipe(
        switchMap((partyID) => this.partyManagementService.Get(partyID)),
        untilDestroyed(this),
        shareReplay(1)
    );

    constructor(
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private domainStoreService: DomainStoreService,
        private routingRulesService: RoutingRulesService,
        private fistfulStatistics: FistfulStatisticsService
    ) {}

    reload() {
        this.routingRulesService.reload();
    }
}
