import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Shop } from '@vality/domain-proto/domain';
import { StatWallet } from '@vality/fistful-proto/fistful_stat';
import { DialogResponseStatus, DialogSuperclass } from '@vality/ng-core';

import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { RoutingRulesService } from '../../services/routing-rules';
import { RoutingRulesType } from '../../types/routing-rules-type';

@Component({
    templateUrl: 'add-party-routing-rule-dialog.component.html',
})
export class AddPartyRoutingRuleDialogComponent extends DialogSuperclass<
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
        private fb: FormBuilder,
        private routingRulesService: RoutingRulesService,
        private notificationErrorService: NotificationErrorService,
        private destroyRef: DestroyRef,
    ) {
        super();
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => this.dialogRef.close({ status: DialogResponseStatus.Success }),
                error: this.notificationErrorService.error,
            });
    }
}
