import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, NotifyLogService } from '@vality/ng-core';
import { first, map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';

import { handleError } from '../../../../utils';
import { RoutingRulesTypeService } from '../routing-rules-type.service';
import { RoutingRulesService } from '../services/routing-rules';

import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import { PartyDelegateRulesetsService } from './party-delegate-rulesets.service';

@Component({
    selector: 'cc-party-delegate-rulesets',
    templateUrl: 'party-delegate-rulesets.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PartyDelegateRulesetsService, RoutingRulesTypeService],
})
export class PartyDelegateRulesetsComponent {
    displayedColumns = [
        { key: 'partyDelegate', name: 'Party delegate' },
        { key: 'paymentInstitution', name: 'Payment institution' },
        { key: 'mainRuleset', name: 'Main ruleset' },
    ];
    isLoading$ = this.domainStoreService.isLoading$;
    data$ = this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution().pipe(
        map((rules) =>
            rules.map(({ mainRoutingRule, partyDelegate, paymentInstitution }) => ({
                parentRefId: mainRoutingRule?.ref?.id,
                delegateIdx: mainRoutingRule?.data?.decisions?.delegates?.findIndex(
                    (d) => d === partyDelegate,
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
            })),
        ),
    );

    private get partyID() {
        return this.route.snapshot.params.partyID as string;
    }

    constructor(
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private routingRulesService: RoutingRulesService,
        private router: Router,
        private dialogService: DialogService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
        private route: ActivatedRoute,
        private destroyRef: DestroyRef,
        protected routingRulesTypeService: RoutingRulesTypeService,
    ) {}

    attachNewRuleset() {
        this.dialogService
            .open(AttachNewRulesetDialogComponent, {
                partyID: this.partyID,
                type: this.route.snapshot.params.type,
            })
            .afterClosed()
            .pipe(handleError(this.log.error), takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    navigateToPartyRuleset(parentRefId: number, delegateIdx: number) {
        this.routingRulesService
            .getRuleset(parentRefId)
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
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
