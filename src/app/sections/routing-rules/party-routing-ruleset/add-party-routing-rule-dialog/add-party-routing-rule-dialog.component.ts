import { Component, Injector } from '@angular/core';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Shop } from '@vality/domain-proto/lib/domain';
import { StatWallet } from '@vality/fistful-proto/lib/fistful_stat';
import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@vality/ng-core';

import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { RoutingRulesService } from '../../services/routing-rules';
import { RoutingRulesType } from '../../types/routing-rules-type';

@UntilDestroy()
@Component({
    templateUrl: 'add-party-routing-rule-dialog.component.html',
})
export class AddPartyRoutingRuleDialogComponent extends BaseDialogSuperclass<
    AddPartyRoutingRuleDialogComponent,
    { refID: number; partyID: string; shops: Shop[]; wallets: StatWallet[]; type: RoutingRulesType }
> {
    form = this.fb.group<{ shopID: string; walletID: string; name: string; description: string }>({
        shopID: '',
        walletID: '',
        name: 'Ruleset[candidates]',
        description: '',
    });

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private routingRulesService: RoutingRulesService,
        private notificationErrorService: NotificationErrorService
    ) {
        super(injector);
    }

    add() {
        const { shopID, walletID, name, description } = this.form.value;
        (this.dialogData.type === RoutingRulesType.Payment
            ? this.routingRulesService.addShopRuleset({
                  name,
                  description,
                  partyRulesetRefID: this.dialogData.refID,
                  partyID: this.dialogData.partyID,
                  shopID,
              })
            : this.routingRulesService.addWalletRuleset({
                  name,
                  description,
                  partyRulesetRefID: this.dialogData.refID,
                  partyID: this.dialogData.partyID,
                  walletID,
              })
        )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: () => this.dialogRef.close({ status: BaseDialogResponseStatus.Success }),
                error: this.notificationErrorService.error,
            });
    }
}
