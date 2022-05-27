import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Predicate, TerminalObject } from '@vality/domain-proto/lib/domain';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';

import { objectToJSON } from '@cc/app/api/utils';
import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';

import { handleError } from '../../../../utils/operators/handle-error';
import { ErrorService } from '../../../shared/services/error';
import { damselInstanceToObject } from '../../../thrift-services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { AddShopPaymentRoutingRuleDialogComponent } from './add-shop-payment-routing-rule-dialog';
import { ShopPaymentRoutingRulesetService } from './shop-payment-routing-ruleset.service';

@UntilDestroy()
@Component({
    selector: 'cc-shop-payment-routing-ruleset',
    templateUrl: 'shop-payment-routing-ruleset.component.html',
    providers: [ShopPaymentRoutingRulesetService],
})
export class ShopPaymentRoutingRulesetComponent {
    shopRuleset$ = this.shopPaymentRoutingRulesetService.shopRuleset$;
    partyID$ = this.shopPaymentRoutingRulesetService.partyID$;
    partyRulesetRefID$ = this.shopPaymentRoutingRulesetService.partyRulesetRefID$;
    shop$ = this.shopPaymentRoutingRulesetService.shop$;
    candidates$ = this.shopPaymentRoutingRulesetService.shopRuleset$.pipe(
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
        private shopPaymentRoutingRulesetService: ShopPaymentRoutingRulesetService,
        private domainStoreService: DomainStoreService,
        private errorService: ErrorService
    ) {}

    addShopRule() {
        this.shopPaymentRoutingRulesetService.refID$
            .pipe(
                first(),
                switchMap((refID) =>
                    this.baseDialogService
                        .open(AddShopPaymentRoutingRuleDialogComponent, { refID })
                        .afterClosed()
                )
            )

            .pipe(handleError(this.errorService.error), untilDestroyed(this))
            .subscribe();
    }

    removeShopRule(idx: number) {
        this.shopPaymentRoutingRulesetService.removeShopRule(idx);
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
