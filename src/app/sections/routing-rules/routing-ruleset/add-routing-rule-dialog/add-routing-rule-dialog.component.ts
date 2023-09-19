import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { domain } from '@vality/domain-proto';
import { Predicate } from '@vality/domain-proto/domain';
import { DialogSuperclass } from '@vality/ng-core';

import { AddRoutingRuleDialogService, TerminalType } from './add-routing-rule-dialog.service';

@UntilDestroy()
@Component({
    templateUrl: 'add-routing-rule-dialog.component.html',
    styleUrls: ['add-routing-rule-dialog.component.scss'],
    providers: [AddRoutingRuleDialogService],
})
export class AddRoutingRuleDialogComponent extends DialogSuperclass<
    AddRoutingRuleDialogComponent,
    { refID: number }
> {
    form = this.addShopRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopRoutingRuleDialogService.newTerminalOptionsForm;
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    terminalType = TerminalType;
    riskScore = domain.RiskScore;

    constructor(
        injector: Injector,
        private addShopRoutingRuleDialogService: AddRoutingRuleDialogService,
        private fb: FormBuilder,
    ) {
        super(injector);
    }

    add() {
        this.addShopRoutingRuleDialogService.add(
            this.predicateControl.value,
            this.dialogData.refID,
        );
    }

    addOption() {
        this.addShopRoutingRuleDialogService.addOption();
    }

    removeOption(idx: number) {
        this.addShopRoutingRuleDialogService.removeOption(idx);
    }
}
