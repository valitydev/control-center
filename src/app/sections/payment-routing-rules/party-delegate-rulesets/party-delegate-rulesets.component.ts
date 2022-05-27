import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { first, map, switchMap, take } from 'rxjs/operators';

import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';

import { handleError } from '../../../../utils/operators/handle-error';
import { ErrorService } from '../../../shared/services/error';
import { RoutingRulesService } from '../../../thrift-services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import { PartyDelegateRulesetsService } from './party-delegate-rulesets.service';

@UntilDestroy()
@Component({
    selector: 'cc-party-delegate-rulesets',
    templateUrl: 'party-delegate-rulesets.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PartyDelegateRulesetsService],
})
export class PartyDelegateRulesetsComponent {
    displayedColumns = [
        { key: 'paymentInstitution', name: 'Payment institution' },
        { key: 'mainRuleset', name: 'Main ruleset' },
        { key: 'partyDelegate', name: 'Party delegate' },
    ];
    isLoading$ = this.domainStoreService.isLoading$;
    data$ = this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution().pipe(
        map((rules) =>
            rules.map(({ mainRoutingRule, partyDelegate, paymentInstitution }) => ({
                parentRefId: mainRoutingRule?.ref?.id,
                delegateIdx: mainRoutingRule?.data?.decisions?.delegates?.findIndex(
                    (d) => d === partyDelegate
                ),
                paymentInstitution: {
                    text: paymentInstitution?.data?.name,
                    caption: paymentInstitution?.ref?.id,
                },
                mainRuleset: {
                    text: mainRoutingRule?.data?.name,
                    caption: mainRoutingRule?.ref?.id,
                },
                partyDelegate: {
                    text: partyDelegate?.description,
                    caption: partyDelegate?.ruleset?.id,
                },
            }))
        )
    );

    constructor(
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private paymentRoutingRulesService: RoutingRulesService,
        private router: Router,
        private baseDialogService: BaseDialogService,
        private domainStoreService: DomainStoreService,
        private errorService: ErrorService
    ) {}

    attachNewRuleset() {
        this.partyDelegateRulesetsService.partyID$
            .pipe(
                take(1),
                switchMap((partyID) =>
                    this.baseDialogService
                        .open(AttachNewRulesetDialogComponent, { partyID })
                        .afterClosed()
                ),
                handleError(this.errorService.error),
                untilDestroyed(this)
            )
            .subscribe();
    }

    navigateToPartyRuleset(parentRefId: number, delegateIdx: number) {
        combineLatest([
            this.partyDelegateRulesetsService.partyID$,
            this.paymentRoutingRulesService.getRuleset(parentRefId),
        ])
            .pipe(first(), untilDestroyed(this))
            .subscribe(([partyID, parent]) =>
                this.router.navigate([
                    'party',
                    partyID,
                    'payment-routing-rules',
                    parent.data.decisions.delegates[delegateIdx].ruleset.id,
                ])
            );
    }
}
