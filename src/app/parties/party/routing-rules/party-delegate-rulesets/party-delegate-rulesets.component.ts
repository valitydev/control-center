import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Column, DialogService, NotifyLogService } from '@vality/matez';
import { catchError, first, map } from 'rxjs/operators';

import { RoutingRulesListItem } from '../components/routing-rules-list';
import { RoutingRulesTypeService } from '../routing-rules-type.service';
import { RoutingRulesService } from '../services/routing-rules';
import { RoutingRulesType } from '../types/routing-rules-type';

import { AttachNewRulesetDialogComponent } from './attach-new-ruleset-dialog';
import {
    DelegateWithPaymentInstitution,
    PartyDelegateRulesetsService,
} from './party-delegate-rulesets.service';

import { RoutingRulesStoreService } from '~/api/domain-config';
import { createDomainObjectColumn } from '~/utils';

@Component({
    selector: 'cc-party-delegate-rulesets',
    templateUrl: 'party-delegate-rulesets.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PartyDelegateRulesetsService, RoutingRulesTypeService],
    standalone: false,
})
export class PartyDelegateRulesetsComponent {
    private partyDelegateRulesetsService = inject(PartyDelegateRulesetsService);
    private routingRulesService = inject(RoutingRulesService);
    private router = inject(Router);
    private dialogService = inject(DialogService);
    private routingRulesStoreService = inject(RoutingRulesStoreService);
    private log = inject(NotifyLogService);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    protected routingRulesTypeService = inject(RoutingRulesTypeService);

    columns: Column<RoutingRulesListItem<DelegateWithPaymentInstitution>>[] = [
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
    isLoading$ = this.routingRulesStoreService.isLoading$;
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
        return this.route.snapshot.params['partyID'] as string;
    }

    attachNewRuleset() {
        this.dialogService
            .open(AttachNewRulesetDialogComponent, {
                partyID: this.partyID,
                type: this.route.snapshot.params['type'],
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
                    'parties',
                    this.partyID,
                    'routing-rules',
                    this.route.snapshot.params['type'] as RoutingRulesType,
                    parent.data.decisions.delegates[delegateIdx].ruleset.id,
                ]);
            });
    }
}
