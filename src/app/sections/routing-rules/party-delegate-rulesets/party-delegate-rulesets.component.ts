import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogService } from '@vality/ng-core';
import { first, map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { handleError } from '../../../../utils/operators/handle-error';
import { RoutingRulesService } from '../services/routing-rules';
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

    private get partyID() {
        return this.route.snapshot.params.partyID as string;
    }

    constructor(
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private routingRulesService: RoutingRulesService,
        private router: Router,
        private baseDialogService: BaseDialogService,
        private domainStoreService: DomainStoreService,
        private errorService: NotificationErrorService,
        private route: ActivatedRoute
    ) {}

    attachNewRuleset() {
        this.baseDialogService
            .open(AttachNewRulesetDialogComponent, {
                partyID: this.partyID,
                type: this.route.snapshot.params.type,
            })
            .afterClosed()
            .pipe(handleError(this.errorService.error), untilDestroyed(this))
            .subscribe();
    }

    navigateToPartyRuleset(parentRefId: number, delegateIdx: number) {
        this.routingRulesService
            .getRuleset(parentRefId)
            .pipe(first(), untilDestroyed(this))
            .subscribe((parent) => {
                void this.router.navigate([
                    'party',
                    this.partyID,
                    'routing-rules',
                    this.route.snapshot.params.type as RoutingRulesType,
                    parent.data.decisions.delegates[delegateIdx].ruleset.id,
                ]);
            });
    }
}
