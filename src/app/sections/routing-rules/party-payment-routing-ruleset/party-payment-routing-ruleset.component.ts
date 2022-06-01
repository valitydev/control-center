import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { filter, map, pluck, shareReplay, switchMap, take } from 'rxjs/operators';

import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';

import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { AddPartyPaymentRoutingRuleDialogComponent } from './add-party-payment-routing-rule-dialog';
import { InitializePaymentRoutingRulesDialogComponent } from './initialize-payment-routing-rules-dialog';
import { PartyPaymentRoutingRulesetService } from './party-payment-routing-ruleset.service';

@UntilDestroy()
@Component({
    selector: 'cc-party-payment-routing-ruleset',
    templateUrl: 'party-payment-routing-ruleset.component.html',
    styleUrls: ['party-payment-routing-ruleset.component.scss'],
    providers: [PartyPaymentRoutingRulesetService],
})
export class PaymentRoutingRulesComponent {
    partyRuleset$ = this.partyPaymentRoutingRulesetService.partyRuleset$;
    partyID$ = this.partyPaymentRoutingRulesetService.partyID$;
    routingRulesType$ = this.route.params.pipe(pluck('type'));
    isLoading$ = this.domainStoreService.isLoading$;

    displayedColumns = [
        { key: 'shop', name: 'Shop' },
        { key: 'id', name: 'Delegate (Ruleset Ref ID)' },
    ];
    data$ = combineLatest([this.partyRuleset$, this.partyPaymentRoutingRulesetService.shops$]).pipe(
        filter(([r]) => !!r),
        map(([ruleset, shops]) =>
            ruleset.data.decisions.delegates
                .filter((d) => d?.allowed?.condition?.party?.definition?.shop_is)
                .map((delegate) => {
                    const shopId = delegate.allowed.condition.party.definition.shop_is;
                    return {
                        parentRefId: ruleset.ref.id,
                        delegateIdx: ruleset.data.decisions.delegates.findIndex(
                            (d) => d === delegate
                        ),
                        id: {
                            text: delegate?.description,
                            caption: delegate?.ruleset?.id,
                        },
                        shop: {
                            text: shops?.find((s) => s?.id === shopId)?.details?.name,
                            caption: shopId,
                        },
                    };
                })
        ),
        shareReplay(1)
    );

    constructor(
        private baseDialogService: BaseDialogService,
        private partyPaymentRoutingRulesetService: PartyPaymentRoutingRulesetService,
        private router: Router,
        private route: ActivatedRoute,
        private domainStoreService: DomainStoreService
    ) {}

    initialize() {
        combineLatest([
            this.partyPaymentRoutingRulesetService.partyID$,
            this.partyPaymentRoutingRulesetService.refID$,
        ])
            .pipe(
                take(1),
                switchMap(([partyID, refID]) =>
                    this.baseDialogService
                        .open(InitializePaymentRoutingRulesDialogComponent, { partyID, refID })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe();
    }

    addPartyRule() {
        combineLatest([
            this.partyPaymentRoutingRulesetService.refID$,
            this.partyPaymentRoutingRulesetService.shops$,
            this.partyPaymentRoutingRulesetService.partyID$,
        ])
            .pipe(
                take(1),
                switchMap(([refID, shops, partyID]) =>
                    this.baseDialogService
                        .open(AddPartyPaymentRoutingRuleDialogComponent, { refID, shops, partyID })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe();
    }

    navigateToShopRuleset(parentRefId: number, delegateIdx: number) {
        this.partyPaymentRoutingRulesetService.partyRuleset$
            .pipe(take(1), untilDestroyed(this))
            .subscribe((ruleset) =>
                this.router.navigate([
                    'party',
                    this.route.snapshot.params.partyID,
                    'routing-rules',
                    this.route.snapshot.params.type,
                    parentRefId,
                    'shop-ruleset',
                    ruleset?.data?.decisions?.delegates?.[delegateIdx]?.ruleset?.id,
                ])
            );
    }
}
