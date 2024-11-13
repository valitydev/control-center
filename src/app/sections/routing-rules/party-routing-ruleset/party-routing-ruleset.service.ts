import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NotifyLogService } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { combineLatest, defer, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { createDsl, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { PartyManagementService } from '@cc/app/api/payment-processing';

import { PartyDelegateRulesetsService } from '../party-delegate-rulesets';
import { RoutingRulesService } from '../services/routing-rules';

export const MAIN_REF = 'main';

@Injectable()
export class PartyRoutingRulesetService {
    partyID$ = this.route.params.pipe(
        map((r) => r['partyID']),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    ) as Observable<string>;
    refID$ = this.route.params.pipe(
        map((r) => r['partyRefID']),
        switchMap((r) =>
            r === MAIN_REF
                ? this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution().pipe(
                      take(1),
                      map((r) => (r.length === 1 ? r[0].partyDelegate.ruleset.id : null)),
                  )
                : of(Number(r)),
        ),
        tap((id) => {
            if (isNaN(id) || isNil(id)) {
                this.log.error('Unknown delegate');
            }
        }),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    shops$ = defer(() => this.party$).pipe(
        map((p) => p.shops),
        map((shops) => Array.from(shops.values())),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    wallets$ = defer(() => this.partyID$).pipe(
        switchMap((partyID) =>
            this.fistfulStatistics.GetWallets({
                dsl: createDsl({ wallets: { party_id: partyID } }),
            }),
        ),
        map((v) => v?.data?.wallets),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    partyRuleset$ = combineLatest([this.routingRulesService.rulesets$, this.refID$]).pipe(
        map(([rules, refID]) => rules.find((r) => r?.ref?.id === refID)),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    private party$ = this.partyID$.pipe(
        switchMap((partyID) => this.partyManagementService.Get(partyID)),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    constructor(
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private routingRulesService: RoutingRulesService,
        private fistfulStatistics: FistfulStatisticsService,
        private destroyRef: DestroyRef,
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private log: NotifyLogService,
    ) {}

    reload() {
        this.routingRulesService.reload();
    }
}
