import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { RoutingCandidate } from '@vality/domain-proto/domain';
import { DialogSuperclass, DialogResponseStatus } from '@vality/ng-core';

import { RoutingRulesService } from '../../services/routing-rules';

@UntilDestroy()
@Component({
    templateUrl: 'add-routing-rule-dialog.component.html',
    styleUrls: ['add-routing-rule-dialog.component.scss'],
})
export class AddRoutingRuleDialogComponent extends DialogSuperclass<
    AddRoutingRuleDialogComponent,
    { refID: number; idx?: number }
> {
    control = this.fb.control<RoutingCandidate>(null, Validators.required);

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private routingRulesService: RoutingRulesService,
    ) {
        super(injector);
    }

    add() {
        this.routingRulesService
            .addShopRule(this.dialogData.refID, this.control.value)
            .subscribe(() => this.dialogRef.close({ status: DialogResponseStatus.Success }));
    }
}
