import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Predicate, TerminalObject } from '@vality/domain-proto/domain';
import { DialogResponseStatus, DialogService } from '@vality/ng-core';
import { Observable } from 'rxjs';
import { first, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { NotificationService } from '@cc/app/shared/services/notification';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { objectToJSON } from '@cc/utils/thrift-instance';

import { AddRoutingRuleDialogComponent } from './add-routing-rule-dialog';
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
    candidates$ = this.routingRulesetService.shopRuleset$.pipe(
        map((r) => r.data.decisions.candidates.sort((a, b) => b.priority - a.priority)),
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
        private dialogService: DialogService,
        private routingRulesetService: RoutingRulesetService,
        private domainStoreService: DomainStoreService,
        private notificationErrorService: NotificationErrorService,
        private notificationService: NotificationService,
        private route: ActivatedRoute,
    ) {}

    addShopRule() {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refID) =>
                    this.dialogService.open(AddRoutingRuleDialogComponent, { refID }).afterClosed(),
                ),
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.domainStoreService.forceReload();
                        this.notificationService.success('Routing rule successfully added');
                    }
                },
                error: (err) => {
                    this.notificationErrorService.error(err);
                    this.notificationService.success('Error while adding routing rule');
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
