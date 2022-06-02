import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Predicate, TerminalObject } from '@vality/domain-proto/lib/domain';
import { Observable } from 'rxjs';
import { first, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { objectToJSON } from '@cc/app/api/utils';
import { RoutingRulesType } from '@cc/app/sections/routing-rules/types/routing-rules-type';
import { NotificationService } from '@cc/app/shared/services/notification';
import { BaseDialogResponseStatus } from '@cc/components/base-dialog';
import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';

import { ErrorService } from '../../../shared/services/error';
import { damselInstanceToObject } from '../../../thrift-services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { AddShopRoutingRuleDialogComponent } from './add-shop-routing-rule-dialog';
import { ShopRoutingRulesetService } from './shop-routing-ruleset.service';

@UntilDestroy()
@Component({
    selector: 'cc-shop-routing-ruleset',
    templateUrl: 'shop-routing-ruleset.component.html',
    providers: [ShopRoutingRulesetService],
})
export class ShopRoutingRulesetComponent {
    shopRuleset$ = this.shopRoutingRulesetService.shopRuleset$;
    partyID$ = this.shopRoutingRulesetService.partyID$;
    partyRulesetRefID$ = this.shopRoutingRulesetService.partyRulesetRefID$;
    routingRulesType$ = this.route.params.pipe(pluck('type')) as Observable<RoutingRulesType>;
    shop$ = this.shopRoutingRulesetService.shop$;
    candidates$ = this.shopRoutingRulesetService.shopRuleset$.pipe(
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
        private shopRoutingRulesetService: ShopRoutingRulesetService,
        private domainStoreService: DomainStoreService,
        private errorService: ErrorService,
        private notificationService: NotificationService,
        private route: ActivatedRoute
    ) {}

    addShopRule() {
        this.shopRoutingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refID) =>
                    this.baseDialogService
                        .open(AddShopRoutingRuleDialogComponent, { refID })
                        .afterClosed()
                )
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (res.status === BaseDialogResponseStatus.Success) {
                        this.domainStoreService.forceReload();
                        this.notificationService.success('Shop routing ruleset successfully added');
                    }
                },
                error: (err) => {
                    this.errorService.error(err);
                    this.notificationService.success('Error while adding shop routing ruleset');
                },
            });
    }

    removeShopRule(idx: number) {
        this.shopRoutingRulesetService.removeShopRule(idx);
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
