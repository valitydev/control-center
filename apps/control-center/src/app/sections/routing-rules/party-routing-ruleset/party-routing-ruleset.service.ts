import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NotifyLogService } from '@vality/matez';
import isNil from 'lodash-es/isNil';
import { Observable, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { PartyDelegateRulesetsService } from '../party-delegate-rulesets';
import { RoutingRulesService } from '../services/routing-rules';

export const MAIN_REF = 'main';

@Injectable()
export class PartyRoutingRulesetService {
    private route = inject(ActivatedRoute);
    private partiesStoreService = inject(PartiesStoreService);
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

    shops$ = this.partyID$.pipe(
        switchMap((id) => this.partiesStoreService.getPartyShops(id).value$),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    wallets$ = this.partyID$.pipe(
        switchMap((id) => this.partiesStoreService.getPartyWallets(id).value$),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    partyRuleset$ = combineLatest([this.routingRulesService.rulesets$, this.refID$]).pipe(
        map(([rules, refID]) => rules.find((r) => r?.ref?.id === refID)),
        takeUntilDestroyed(this.dr),
        shareReplay(1),
    );

    reload() {
        this.routingRulesService.reload();
    }
}
