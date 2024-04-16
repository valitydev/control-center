import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RoutingCandidate } from '@vality/domain-proto/domain';
import { Predicate } from '@vality/domain-proto/internal/domain';
import {
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    Column,
    createOperationColumn,
    DragDrop,
    correctPriorities,
} from '@vality/ng-core';
import cloneDeep from 'lodash-es/cloneDeep';
import { Observable, combineLatest, filter } from 'rxjs';
import { first, map, switchMap, withLatestFrom, take } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import {
    DomainThriftFormDialogComponent,
    DomainObjectCardComponent,
    UpdateThriftDialogComponent,
} from '@cc/app/shared/components/thrift-api-crud';

import { objectToJSON, getUnionKey } from '../../../../utils';
import { createPredicateColumn } from '../../../shared';
import { CandidateCardComponent } from '../../../shared/components/candidate-card/candidate-card.component';
import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import { createTerminalColumn } from '../../../shared/utils/table/create-terminal-column';
import { RoutingRulesService } from '../services/routing-rules';

import { RoutingRulesetService } from './routing-ruleset.service';

function togglePredicate(predicate: Predicate): { toggled: Predicate; prevAllowed: boolean } {
    const predicates: Predicate[] =
        getUnionKey(predicate) === 'all_of' ? Array.from(predicate.all_of) : [predicate];
    const idx = predicates.findIndex((a) => getUnionKey(a) === 'constant');
    const prevAllowed = idx !== -1 ? predicates[idx].constant : true;
    if (idx !== -1) {
        predicates.splice(idx, 1);
    }
    predicates.unshift({ constant: !prevAllowed });
    return {
        toggled: { all_of: new Set(predicates) },
        prevAllowed,
    };
}

@Component({
    templateUrl: 'routing-ruleset.component.html',
    providers: [RoutingRulesetService],
})
export class RoutingRulesetComponent {
    ruleset$ = this.routingRulesetService.ruleset$;
    partyID$ = this.routingRulesetService.partyID$;
    partyRulesetRefID$ = this.routingRulesetService.partyRulesetRefID$;
    routingRulesType$ = this.route.params.pipe(map((p) => p.type)) as Observable<RoutingRulesType>;
    candidates$ = this.routingRulesetService.ruleset$.pipe(map((r) => r.data.decisions.candidates));
    isLoading$ = this.domainStoreService.isLoading$;
    columns: Column<RoutingCandidate>[] = [
        { field: 'priority', sortable: true },
        {
            field: 'candidate',
            description: 'description',
            sortable: true,
            formatter: (d) => this.getCandidateIdx(d).pipe(map((idx) => `#${idx + 1}`)),
            click: (d) => {
                combineLatest([this.getCandidateIdx(d), this.routingRulesetService.ruleset$])
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(([idx, ruleset]) => {
                        this.sidenavInfoService.toggle(CandidateCardComponent, {
                            idx,
                            ref: ruleset.ref,
                        });
                    });
            },
        },
        createTerminalColumn((d) => d.terminal.id),
        createPredicateColumn('global_allow', (d) =>
            combineLatest([
                this.domainStoreService.getObjects('terminal'),
                this.routingRulesType$,
            ]).pipe(
                map(([terminals, type]) => {
                    const terms = terminals.find((t) => t.ref.id === d.terminal.id).data?.terms;
                    return type === RoutingRulesType.Payment
                        ? terms?.payments?.global_allow
                        : terms?.wallet?.withdrawals?.global_allow;
                }),
            ),
        ),
        createPredicateColumn('allowed', (d) => d.allowed, {
            click: (d) => {
                this.getCandidateIdx(d)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((idx) => {
                        void this.toggleAllow(idx);
                    });
            },
        }),
        { field: 'weight', sortable: true },
        {
            field: 'pin',
            formatter: (d) => JSON.stringify(objectToJSON(d.pin?.features)),
            hide: true,
        },
        createOperationColumn<RoutingCandidate>([
            {
                label: 'Edit',
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe((idx) => {
                            this.editRule(idx);
                        });
                },
            },
            {
                label: 'Duplicate',
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe((idx) => {
                            void this.duplicateRule(idx);
                        });
                },
            },
            {
                label: (d) => (togglePredicate(d.allowed).prevAllowed ? 'Deny' : 'Allow'),
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe((idx) => {
                            void this.toggleAllow(idx);
                        });
                },
            },
            {
                label: 'Remove',
                click: (d) => {
                    this.getCandidateIdx(d)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe((idx) => {
                            void this.removeRule(idx);
                        });
                },
            },
        ]),
    ];

    constructor(
        private dialog: DialogService,
        private routingRulesetService: RoutingRulesetService,
        private routingRulesService: RoutingRulesService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
        private route: ActivatedRoute,
        private sidenavInfoService: SidenavInfoService,
        private destroyRef: DestroyRef,
    ) {}

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
                        this.domainStoreService.forceReload();
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
                            action: (params) =>
                                this.routingRulesService.updateRule(refId, idx, params),
                        })
                        .afterClosed(),
                ),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
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
                        this.domainStoreService.forceReload();
                        this.log.successOperation('create', 'Routing rule');
                    }
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    toggleAllow(idx: number) {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refId) => this.routingRulesService.getCandidate(refId, idx)),
                withLatestFrom(this.routingRulesetService.refID$),
                switchMap(([candidate, refId]) => {
                    const newAllowed = togglePredicate(candidate.allowed).toggled;
                    return this.dialog
                        .open(UpdateThriftDialogComponent, {
                            title: 'Toggle allowed',
                            prevObject: candidate.allowed,
                            object: newAllowed,
                            action: () =>
                                this.routingRulesService.updateRule(refId, idx, {
                                    ...candidate,
                                    allowed: newAllowed,
                                }),
                        })
                        .afterClosed();
                }),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res.status === DialogResponseStatus.Success) {
                    this.domainStoreService.forceReload();
                    this.log.successOperation('update', 'Allowed');
                }
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
                        return this.domainStoreService.commit({
                            ops: [
                                {
                                    update: {
                                        old_object: { routing_rules: ruleset },
                                        new_object: { routing_rules: newRuleset },
                                    },
                                },
                            ],
                        });
                    },
                ),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('update', 'candidates');
                    this.domainStoreService.forceReload();
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
