import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap, take } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';

import { handleError } from '../../../../utils/operators/handle-error';
import { ErrorService } from '../../../shared/services/error';
import { RoutingRulesService as RoutingRulesDamselService } from '../../../thrift-services';

@Injectable()
export class RoutingRulesetService {
    partyID$: Observable<string> = this.route.params.pipe(pluck('partyID'), shareReplay(1));
    partyRulesetRefID$: Observable<number> = this.route.params.pipe(
        pluck('partyRefID'),
        map((p) => +p),
        shareReplay(1)
    );
    refID$: Observable<number> = this.route.params.pipe(
        pluck('refID'),
        map((p) => +p),
        shareReplay(1)
    );
    shopRuleset$ = this.refID$.pipe(
        switchMap((refID) => this.routingRulesService.getRuleset(refID)),
        shareReplay(1)
    );
    private party$ = this.partyID$.pipe(
        switchMap((partyID) => this.partyManagementWithUserService.getParty(partyID)),
        shareReplay(1)
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    shop$ = combineLatest([this.party$, this.shopRuleset$]).pipe(
        map(([{ shops }, ruleset]) =>
            shops.get(
                ruleset?.data?.decisions?.delegates?.find(
                    (d) => d?.allowed?.condition?.party?.definition?.shop_is
                )?.allowed?.condition?.party?.definition?.shop_is
            )
        ),
        shareReplay(1)
    );

    constructor(
        private routingRulesService: RoutingRulesDamselService,
        private route: ActivatedRoute,
        private partyManagementWithUserService: PartyManagementWithUserService,
        private errorService: ErrorService
    ) {}

    removeShopRule(candidateIdx: number) {
        this.refID$
            .pipe(
                take(1),
                switchMap((refID) =>
                    this.routingRulesService.removeShopRule({
                        refID,
                        candidateIdx,
                    })
                ),
                handleError(this.errorService.error)
            )
            .subscribe();
    }
}
