import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { RoutingCandidate } from '@vality/domain-proto/domain';
import {
    Column,
    DialogResponseStatus,
    DialogService,
    DragDrop,
    NotifyLogService,
    correctPriorities,
    createMenuColumn,
} from '@vality/matez';
import { toJson } from '@vality/ng-thrift';
import cloneDeep from 'lodash-es/cloneDeep';
import { Observable, combineLatest, filter } from 'rxjs';
import { first, map, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { DomainService, RoutingRulesStoreService } from '../../../../api/domain-config';
import {
    createDomainObjectColumn,
    createPredicateColumn,
    getPredicateBoolean,
} from '../../../shared';
import { CandidateCardComponent } from '../../../shared/components/candidate-card/candidate-card.component';
import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import {
    DomainThriftFormDialogComponent,
    UpdateThriftDialogComponent,
} from '../../../shared/components/thrift-api-crud';
import { DomainObjectCardComponent } from '../../../shared/components/thrift-api-crud/domain2';
import { RoutingRulesService } from '../services/routing-rules';
import { RoutingRulesType } from '../types/routing-rules-type';
import { changeCandidatesAllowed } from '../utils/toggle-candidate-allowed';

import { RoutingRulesetService } from './routing-ruleset.service';

@Component({
    templateUrl: 'routing-ruleset.component.html',
    providers: [RoutingRulesetService],
    standalone: false,
})
export class RoutingRulesetComponent {
    private dialog = inject(DialogService);
    private routingRulesetService = inject(RoutingRulesetService);
    private routingRulesService = inject(RoutingRulesService);
    private routingRulesStoreService = inject(RoutingRulesStoreService);
    private domainService = inject(DomainService);
    private log = inject(NotifyLogService);
    private route = inject(ActivatedRoute);
    private sidenavInfoService = inject(SidenavInfoService);
    private destroyRef = inject(DestroyRef);

    ruleset$ = this.routingRulesetService.ruleset$;
    partyID$ = this.routingRulesetService.partyID$;
    partyRulesetRefID$ = this.routingRulesetService.partyRulesetRefID$;
    routingRulesType$ = this.route.params.pipe(
        map((p) => p['type']),
    ) as Observable<RoutingRulesType>;
    candidates$ = this.routingRulesetService.ruleset$.pipe(map((r) => r.data.decisions.candidates));
    isLoading$ = this.routingRulesStoreService.isLoading$;

    columns: Column<RoutingCandidate>[] = [
        { field: 'priority' },
        {
            field: 'candidate',
            cell: (d) =>
                this.getCandidateIdx(d).pipe(
                    map((idx) => ({
                        value: `#${idx + 1}`,
                        description: d.description,
                        click: () => {
                            this.routingRulesetService.ruleset$
                                .pipe(first())
                                .subscribe((ruleset) => {
                                    this.sidenavInfoService.toggle(CandidateCardComponent, {
                                        idx,
                                        ref: ruleset.ref,
                                    });
                                });
                        },
                    })),
                ),
        },
        createDomainObjectColumn((d) => ({ ref: { terminal: d.terminal } }), {
            header: 'Terminal',
        }),
        createPredicateColumn(
            (d) =>
                combineLatest([
                    this.domainService.get({ terminal: { id: d.terminal.id } }),
                    this.routingRulesType$,
                ]).pipe(
                    map(([terminal, type]) => {
                        const terms = terminal?.object?.terminal?.data?.terms;
                        return {
                            predicate:
                                type === RoutingRulesType.Payment
                                    ? terms?.payments?.global_allow
                                    : terms?.wallet?.withdrawals?.global_allow,
                        };
                    }),
                ),
            { header: 'Global Allow' },
        ),
        createPredicateColumn(
            (d) => ({
                predicate: d.allowed,
                toggle: () => {
                    this.getCandidateIdx(d)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe((idx) => {
                            void this.toggleAllow(idx);
                        });
                },
            }),
            {
                header: 'Allowed',
            },
        ),
        { field: 'weight' },
        {
            field: 'pin',
            cell: (d) => ({
                value: JSON.stringify(toJson(d.pin?.features)),
            }),
            hidden: true,
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Edit',
                    click: () => {
                        this.getCandidateIdx(d)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((idx) => {
                                this.editRule(idx);
                            });
                    },
                },
                {
                    label: 'Duplicate',
                    click: () => {
                        this.getCandidateIdx(d)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((idx) => {
                                void this.duplicateRule(idx);
                            });
                    },
                },
                {
                    label: getPredicateBoolean(d.allowed) ? 'Deny' : 'Allow',
                    click: () => {
                        this.getCandidateIdx(d)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((idx) => {
                                void this.toggleAllow(idx);
                            });
                    },
                },
                {
                    label: 'Remove',
                    click: () => {
                        this.getCandidateIdx(d)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((idx) => {
                                void this.removeRule(idx);
                            });
                    },
                },
            ],
        })),
    ];
    sort: Sort = { active: 'priority', direction: 'desc' };

    addRule() {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) =>
                    this.dialog
                        .open(DomainThriftFormDialogComponent<RoutingCandidate>, {
                            type: 'RoutingCandidate',
                            title: 'Add routing candidate',
                            object: { allowed: { all_of: new Set([{ constant: true }]) } },
                            action: (params) => this.routingRulesService.addRule(refId, params),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.routingRulesStoreService.reload();
                        this.log.successOperation('create', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err, 'Error while adding routing rule');
                },
            });
    }

    editRule(idx: number) {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) => this.routingRulesService.getCandidate(refId, idx)),
                withLatestFrom(this.routingRulesetService.refID$),
                switchMap(([candidate, refId]) =>
                    this.dialog
                        .open(DomainThriftFormDialogComponent<RoutingCandidate>, {
                            type: 'RoutingCandidate',
                            title: `Edit routing candidate #${idx + 1}`,
                            object: candidate,
                            action: (newCandidate) =>
                                this.routingRulesService.updateRules([
                                    { refId, candidateIdx: idx, newCandidate },
                                ]),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.routingRulesStoreService.reload();
                        this.log.successOperation('update', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    duplicateRule(idx: number) {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) => this.routingRulesService.getCandidate(refId, idx)),
                withLatestFrom(this.routingRulesetService.refID$),
                switchMap(([candidate, refId]) =>
                    this.dialog
                        .open(DomainThriftFormDialogComponent<RoutingCandidate>, {
                            type: 'RoutingCandidate',
                            title: 'Add routing candidate',
                            object: candidate,
                            actionType: 'create',
                            action: (params) => this.routingRulesService.addRule(refId, params),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.routingRulesStoreService.reload();
                        this.log.successOperation('create', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    toggleAllow(candidateIdx: number) {
        this.routingRulesetService.refID$
            .pipe(first(), takeUntilDestroyed(this.destroyRef))
            .subscribe((refId) => {
                changeCandidatesAllowed([{ refId, candidateIdx }]);
            });
    }

    removeRule(idx: number) {
        this.routingRulesetService.removeRule(idx);
    }

    getCandidateIdx(candidate: RoutingCandidate) {
        return this.candidates$.pipe(
            map((candidates) => candidates.findIndex((c) => c === candidate)),
            first(),
        );
    }

    drop(e: DragDrop<RoutingCandidate>) {
        const prevPriorities = e.currentData.map((d) => d.priority);
        const resPriorities =
            e.sort.direction === 'desc'
                ? correctPriorities(prevPriorities)
                : correctPriorities(prevPriorities.reverse()).reverse();
        this.candidates$
            .pipe(
                first(),
                switchMap((candidates) =>
                    this.dialog
                        .open(UpdateThriftDialogComponent, {
                            object: candidates.map((c) => ({
                                ...c,
                                priority: resPriorities[e.currentData.findIndex((d) => d === c)],
                            })),
                            prevObject: candidates,
                        })
                        .afterClosed()
                        .pipe(filter((res) => res.status === DialogResponseStatus.Success)),
                ),
                withLatestFrom(this.routingRulesetService.ruleset$),
                switchMap(
                    ([
                        {
                            data: { object: candidates },
                        },
                        ruleset,
                    ]) => {
                        const newRuleset = cloneDeep(ruleset);
                        newRuleset.data.decisions.candidates = candidates as RoutingCandidate[];
                        return this.routingRulesStoreService.commit([
                            { update: { object: { routing_rules: newRuleset } } },
                        ]);
                    },
                ),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('update', 'candidates');
                    this.routingRulesStoreService.reload();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    openRefId() {
        this.ruleset$.pipe(take(1), filter(Boolean)).subscribe(({ ref }) => {
            this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                ref: { routing_rules: { id: Number(ref.id) } },
            });
        });
    }
}
