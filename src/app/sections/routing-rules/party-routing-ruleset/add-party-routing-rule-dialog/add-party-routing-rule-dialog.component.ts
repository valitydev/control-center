import { Component, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Shop } from '@vality/domain-proto/lib/domain';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { ErrorService } from '../../../../shared/services/error';
import { RoutingRulesService } from '../../../../thrift-services';

@UntilDestroy()
@Component({
    templateUrl: 'add-party-routing-rule-dialog.component.html',
})
export class AddPartyRoutingRuleDialogComponent extends BaseDialogSuperclass<
    AddPartyRoutingRuleDialogComponent,
    { refID: number; partyID: string; shops: Shop[] }
> {
    form = this.fb.group({
        shopID: '',
        name: 'Ruleset[candidates]',
        description: '',
    });

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private routingRulesService: RoutingRulesService,
        private errorService: ErrorService
    ) {
        super(injector);
    }

    add() {
        const { shopID, name, description } = this.form.value;
        this.routingRulesService
            .addShopRuleset({
                name,
                description,
                partyRulesetRefID: this.dialogData.refID,
                partyID: this.dialogData.partyID,
                shopID,
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => this.dialogRef.close(), this.errorService.error);
    }
}
