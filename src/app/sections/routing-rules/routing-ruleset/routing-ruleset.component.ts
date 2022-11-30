import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Predicate, TerminalObject } from '@vality/domain-proto/lib/domain';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { Observable } from 'rxjs';
import { first, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { objectToJSON } from '@cc/app/api/utils';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { NotificationService } from '@cc/app/shared/services/notification';

import { ErrorService } from '../../../shared/services/error';
import { damselInstanceToObject } from '../../../thrift-services/damsel';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
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
        map((r) => r.data.decisions.candidates),
        shareReplay(1)
    );
    terminalsMapID$ = this.domainStoreService
        .getObjects('terminal')
        .pipe(
            map((terminals) =>
                terminals.reduce(
                    (acc, t) => ((acc[t.ref.id] = t), acc),
                    {} as { [N in number]: TerminalObject }
                )
            )
        );
    isLoading$ = this.domainStoreService.isLoading$;

    constructor(
        private baseDialogService: BaseDialogService,
        private routingRulesetService: RoutingRulesetService,
        private domainStoreService: DomainStoreService,
        private errorService: ErrorService,
        private notificationService: NotificationService,
        private route: ActivatedRoute
    ) {}

    addShopRule() {
        this.routingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refID) =>
                    this.baseDialogService
                        .open(AddRoutingRuleDialogComponent, { refID })
                        .afterClosed()
                )
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (res.status === BaseDialogResponseStatus.Success) {
                        this.domainStoreService.forceReload();
                        this.notificationService.success('Routing rule successfully added');
                    }
                },
                error: (err) => {
                    this.errorService.error(err);
                    this.notificationService.success('Error while adding routing rule');
                },
            });
    }

    removeShopRule(idx: number) {
        this.routingRulesetService.removeShopRule(idx);
    }

    terminalToObject(terminal: TerminalObject) {
        return objectToJSON(
            damselInstanceToObject<TerminalObject>('domain', 'TerminalObject', terminal)
        );
    }

    predicateToObject(predicate: Predicate) {
        return objectToJSON(damselInstanceToObject<Predicate>('domain', 'Predicate', predicate));
    }
}
