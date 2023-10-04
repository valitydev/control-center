import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
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
import { first, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { DomainThriftFormDialogComponent } from '@cc/app/shared/components/thrift-api-crud';

import { objectToJSON } from '../../../../utils';
import { SidenavInfoService } from '../../../shared/components/sidenav-info';
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
            pinned: 'left',
            field: 'index',
            header: 'Candidate',
            formatter: (d) => this.getCandidateIdx(d).pipe(map((idx) => `${idx + 1}`)),
            click: (d) => {
                this.getCandidateIdx(d)
                    .pipe(untilDestroyed(this))
                    .subscribe((idx) => {
                        this.openedCandidate = d;
                        this.sidenavInfoService.toggle(
                            this.candidateTpl,
                            `Candidate #${idx + 1}`,
                            d,
                        );
                    });
            },
        },
        {
            pinned: 'left',
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
        { field: 'allowed', formatter: (d) => JSON.stringify(objectToJSON(d.allowed)) },
        { field: 'priority', sortable: true },
        { field: 'weight', sortable: true },
        { field: 'pin', formatter: (d) => JSON.stringify(objectToJSON(d.pin?.features)) },
        createOperationColumn<RoutingCandidate>([
            {
                label: 'Edit',
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(untilDestroyed(this))
                        .subscribe((idx) => {
                            this.editShopRule(idx);
                        });
                },
            },
            {
                label: 'Remove',
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(untilDestroyed(this))
                        .subscribe((idx) => {
                            void this.removeShopRule(idx);
                        });
                },
            },
        ]),
    ];
    openedCandidate?: RoutingCandidate;
    sort: Sort = {
        active: 'priority',
        direction: 'desc',
    };

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

    getCandidateIdx(candidate: RoutingCandidate) {
        return this.candidates$.pipe(
            map((candidates) => candidates.findIndex((c) => c === candidate)),
            first(),
        );
    }
}
