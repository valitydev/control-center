import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';

import {
    ShopConfigObject,
    ShopID,
    WalletConfigObject,
    WalletID,
} from '@vality/domain-proto/domain';
import { DialogResponseStatus, DialogSuperclass, NotifyLogService, Option } from '@vality/matez';

import { RoutingRulesService } from '../../services/routing-rules';
import { RoutingRulesType } from '../../types/routing-rules-type';

@Component({
    templateUrl: 'add-party-routing-rule-dialog.component.html',
    standalone: false,
})
export class AddPartyRoutingRuleDialogComponent extends DialogSuperclass<
    AddPartyRoutingRuleDialogComponent,
    {
        refID: number;
        partyID: string;
        shops: ShopConfigObject[];
        wallets: WalletConfigObject[];
        type: RoutingRulesType;
    }
> {
    private fb = inject(FormBuilder);
    private routingRulesService = inject(RoutingRulesService);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);

    form = this.fb.group<{ shopID: string; walletID: string; name: string; description: string }>({
        shopID: null,
        walletID: null,
        name: 'Ruleset[candidates]',
        description: '',
    });

    shopsOptions: Option<ShopID>[] = this.dialogData.shops.map((s) => ({
        value: s.ref.id,
        label: s.data.name,
        description: s.ref.id,
    }));

    walletsOptions: Option<WalletID>[] = this.dialogData.wallets.map((s) => ({
        value: s.ref.id,
        label: s.data.name,
        description: s.ref.id,
    }));

    add() {
        const { shopID, walletID, name, description } = this.form.value;
        this.routingRulesService
            .addRuleset({
                name,
                description,
                partyRulesetRefID: this.dialogData.refID,
                partyID: this.dialogData.partyID,
                definition:
                    this.dialogData.type === RoutingRulesType.Payment
                        ? { shop_is: shopID }
                        : { wallet_is: walletID },
            })
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe({
                next: () => this.dialogRef.close({ status: DialogResponseStatus.Success }),
                error: this.log.error,
            });
    }
}
