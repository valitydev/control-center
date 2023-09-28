import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Predicate, TerminalObject } from '@vality/domain-proto/domain';
import { RoutingCandidate } from '@vality/domain-proto/internal/domain';
import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/ng-core';
import { Observable } from 'rxjs';
import { first, map, pluck, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { objectToJSON } from '@cc/utils/thrift-instance';

import { DomainThriftFormDialogComponent } from '../../../shared/components/thrift-forms-dialogs';
import { RoutingRulesService } from '../services/routing-rules';

import { RoutingRulesetService } from './routing-ruleset.service';

@UntilDestroy()
@Component({
    templateUrl: 'routing-ruleset.component.html',
    providers: [RoutingRulesetService],
})
export class RoutingRulesetComponent {
    shopRuleset$ = this.routingRulesetService.shopRuleset$;
    partyID$ = this.routingRulesetService.partyID$;
    partyRulesetRefID$ = this.routingRulesetService.partyRulesetRefID$;
    routingRulesType$ = this.route.params.pipe(pluck('type')) as Observable<RoutingRulesType>;
    shop$ = this.routingRulesetService.shop$;
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

    constructor(
        private dialog: DialogService,
        private routingRulesetService: RoutingRulesetService,
        private routingRulesService: RoutingRulesService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
        private route: ActivatedRoute,
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

    terminalToObject(terminal: TerminalObject) {
        return objectToJSON(terminal);
    }

    predicateToObject(predicate: Predicate) {
        return objectToJSON(predicate);
    }
}
