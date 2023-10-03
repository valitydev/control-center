import { Component, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TerminalObject, RoutingCandidate } from '@vality/domain-proto/domain';
import {
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    Column,
    createOperationColumn,
} from '@vality/ng-core';
import { Observable } from 'rxjs';
import { first, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';

import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import { DomainThriftFormDialogComponent } from '../../../shared/components/thrift-forms-dialogs';
import { RoutingRulesService } from '../services/routing-rules';

import { RoutingRulesetService } from './routing-ruleset.service';

@UntilDestroy()
@Component({
    templateUrl: 'routing-ruleset.component.html',
    providers: [RoutingRulesetService],
})
export class RoutingRulesetComponent {
    @ViewChild('terminalTpl') terminalTpl: TemplateRef<unknown>;
    @ViewChild('candidateTpl') candidateTpl: TemplateRef<unknown>;

    shopRuleset$ = this.routingRulesetService.shopRuleset$;
    partyID$ = this.routingRulesetService.partyID$;
    partyRulesetRefID$ = this.routingRulesetService.partyRulesetRefID$;
    routingRulesType$ = this.route.params.pipe(map((p) => p.type)) as Observable<RoutingRulesType>;
    shop$ = this.routingRulesetService.shop$;
    candidates$ = this.routingRulesetService.shopRuleset$.pipe(
        map((r) => r.data.decisions.candidates),
    );
    idxCandidates$ = this.routingRulesetService.shopRuleset$.pipe(
        map((r) =>
            r.data.decisions.candidates
                .map((candidate, idx) => ({ candidate, idx }))
                .sort((a, b) => b.candidate.priority - a.candidate.priority),
        ),
        shareReplay(1),
    );
    terminalsMapID$ = this.domainStoreService
        .getObjects('terminal')
        .pipe(
            map((terminals) =>
                terminals.reduce(
                    (acc, t) => ((acc[t.ref.id] = t), acc),
                    {} as { [N in number]: TerminalObject },
                ),
            ),
        );
    isLoading$ = this.domainStoreService.isLoading$;
    columns: Column<RoutingCandidate>[] = [
        {
            field: 'index',
            formatter: (d, idx) => `${idx + 1}`,
            click: (d, idx) => {
                this.openedCandidate = d;
                this.sidenavInfoService.toggle(this.candidateTpl, `Candidate #${idx + 1}`, d);
            },
        },
        {
            field: 'terminal.id',
            header: 'Terminal',
            formatter: (d) =>
                this.domainStoreService
                    .getObjects('terminal')
                    .pipe(
                        map(
                            (terminals) =>
                                terminals.find((t) => t.ref.id === d.terminal.id).data.name,
                        ),
                    ),
            click: (d) => {
                this.openedCandidate = d;
                this.sidenavInfoService.toggle(
                    this.terminalTpl,
                    `Terminal #${d.terminal.id}`,
                    d.terminal.id,
                );
            },
        },
        'description',
        { field: 'allowed', formatter: (d) => JSON.stringify(d.allowed) },
        'priority',
        'weight',
        { field: 'pin', formatter: (d) => JSON.stringify(Array.from(d.pin?.features || [])) },
        createOperationColumn<RoutingCandidate>([
            {
                label: 'Edit',
                click: (d, idx) => void this.editShopRule(idx),
            },
            {
                label: 'Remove',
                click: (d, idx) => void this.removeShopRule(idx),
            },
        ]),
    ];
    openedCandidate?: RoutingCandidate;

    constructor(
        private dialog: DialogService,
        private routingRulesetService: RoutingRulesetService,
        private routingRulesService: RoutingRulesService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
        private route: ActivatedRoute,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    addShopRule() {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) =>
                    this.dialog
                        .open(DomainThriftFormDialogComponent<RoutingCandidate>, {
                            type: 'RoutingCandidate',
                            title: 'Add shop routing candidate',
                            action: (params) => this.routingRulesService.addShopRule(refId, params),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.domainStoreService.forceReload();
                        this.log.successOperation('update', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err, 'Error while adding routing rule');
                },
            });
    }

    editShopRule(idx: number) {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) => this.routingRulesService.getShopCandidate(refId, idx)),
                withLatestFrom(this.routingRulesetService.refID$),
                switchMap(([shopCandidate, refId]) =>
                    this.dialog
                        .open(DomainThriftFormDialogComponent<RoutingCandidate>, {
                            type: 'RoutingCandidate',
                            title: `Edit shop routing candidate #${idx + 1}`,
                            object: shopCandidate,
                            action: (params) =>
                                this.routingRulesService.updateShopRule(refId, idx, params),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.domainStoreService.forceReload();
                        this.log.successOperation('update', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    removeShopRule(idx: number) {
        this.routingRulesetService.removeShopRule(idx);
    }
}
