import { Component, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { ErrorService } from '../../../../shared/services/error';
import { RoutingRulesService } from '../../../../thrift-services';

@UntilDestroy()
@Component({
    selector: 'cc-initialize-payment-routing-rules-dialog',
    templateUrl: 'initialize-payment-routing-rules-dialog.component.html',
})
export class InitializePaymentRoutingRulesDialogComponent extends BaseDialogSuperclass<
    InitializePaymentRoutingRulesDialogComponent,
    { partyID: string; refID: number }
> {
    form = this.fb.group({
        delegateDescription: 'Main delegate[party]',
        name: 'submain ruleset[by shop id]',
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

    init() {
        const { delegateDescription, name, description } = this.form.value;
        this.routingRulesService
            .addPartyRuleset({
                name,
                partyID: this.dialogData.partyID,
                mainRulesetRefID: this.dialogData.refID,
                description,
                delegateDescription,
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => this.dialogRef.close(), this.errorService.error);
    }
}
