import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Column2, DialogService, NotifyLogService } from '@vality/ng-core';
import { first, map, catchError } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { createDomainObjectColumn } from '@cc/app/shared';

import { RoutingRulesListItem } from '../routing-rules-list';
import { RoutingRulesTypeService } from '../routing-rules-type.service';
import { RoutingRulesService } from '../services/routing-rules';

import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import {
    DelegateWithPaymentInstitution,
    PartyDelegateRulesetsService,
} from './party-delegate-rulesets.service';

@Component({
    selector: 'cc-party-delegate-rulesets',
    templateUrl: 'party-delegate-rulesets.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PartyDelegateRulesetsService, RoutingRulesTypeService],
})
export class PartyDelegateRulesetsComponent {
    columns: Column2<RoutingRulesListItem<DelegateWithPaymentInstitution>>[] = [
        {
            field: 'partyDelegate',
            cell: (d) => ({
                value: d.item.partyDelegate?.description || `#${d.item.partyDelegate?.ruleset?.id}`,
                description: d.item.partyDelegate?.ruleset?.id,
                click: () => this.navigateToPartyRuleset(d.parentRefId, d.delegateIdx),
            }),
        },
        createDomainObjectColumn(
            (d) => ({
                ref: { payment_institution: d.item.paymentInstitution.ref },
            }),
            { header: 'Payment Institution' },
        ),
        createDomainObjectColumn(
            (d) => ({
                ref: { routing_rules: d.item.mainRoutingRule.ref },
            }),
            { header: 'Main Ruleset' },
        ),
    ];
    isLoading$ = this.domainStoreService.isLoading$;
    data$ = this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution().pipe(
        map((rules): RoutingRulesListItem<DelegateWithPaymentInstitution>[] =>
            rules.map((item) => ({
                parentRefId: item.mainRoutingRule?.ref?.id,
                delegateIdx: item.mainRoutingRule?.data?.decisions?.delegates?.findIndex(
                    (d) => d === item.partyDelegate,
                ),
                item,
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
            .pipe(
                catchError((err) => {
                    this.log.error(err);
                    throw err;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
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
