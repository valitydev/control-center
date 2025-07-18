import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PartyManagement } from '@vality/domain-proto/payment_processing';
import { NotifyLogService } from '@vality/matez';
import isNil from 'lodash-es/isNil';
import { Observable, combineLatest, defer, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { PartyDelegateRulesetsService } from '../party-delegate-rulesets';
import { RoutingRulesService } from '../services/routing-rules';

export const MAIN_REF = 'main';

@Injectable()
export class PartyRoutingRulesetService {
    private route = inject(ActivatedRoute);
    private partyManagementService = inject(PartyManagement);
    private routingRulesService = inject(RoutingRulesService);
    private dr = inject(DestroyRef);
    private partyDelegateRulesetsService = inject(PartyDelegateRulesetsService);
    private log = inject(NotifyLogService);

    partyID$ = this.route.params.pipe(
        map((r) => r['partyID']),
        takeUntilDestroyed(this.dr),
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
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );

    shops$ = defer(() => this.party$).pipe(
        map((p) => Array.from(p.shops.values())),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    wallets$ = defer(() => this.party$).pipe(
        map((p) => Array.from(p.wallets.values())),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    partyRuleset$ = combineLatest([this.routingRulesService.rulesets$, this.refID$]).pipe(
        map(([rules, refID]) => rules.find((r) => r?.ref?.id === refID)),
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );

    private party$ = this.partyID$.pipe(
        switchMap((partyID) => this.partyManagementService.Get(partyID)),
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );

    reload() {
        this.routingRulesService.reload();
    }
}
