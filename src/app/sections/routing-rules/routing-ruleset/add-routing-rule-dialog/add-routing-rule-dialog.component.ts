import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Predicate, RiskScore } from '@vality/domain-proto/lib/domain';
import { BaseDialogSuperclass } from '@vality/ng-core';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { AddRoutingRuleDialogService, TerminalType } from './add-routing-rule-dialog.service';

@UntilDestroy()
@Component({
    templateUrl: 'add-routing-rule-dialog.component.html',
    styleUrls: ['add-routing-rule-dialog.component.scss'],
    providers: [AddRoutingRuleDialogService],
})
export class AddRoutingRuleDialogComponent extends BaseDialogSuperclass<
    AddRoutingRuleDialogComponent,
    { refID: number }
> {
    form = this.addShopRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopRoutingRuleDialogService.newTerminalOptionsForm;
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    terminalType = TerminalType;
    riskScore = RiskScore;
    terminals$ = this.domainStoreService.getObjects('terminal');

    constructor(
        injector: Injector,
        private addShopRoutingRuleDialogService: AddRoutingRuleDialogService,
        private domainStoreService: DomainStoreService,
        private fb: FormBuilder
    ) {
        super(injector);
    }

    add() {
        this.addShopRoutingRuleDialogService.add(
            this.predicateControl.value,
            this.dialogData.refID
        );
    }

    addOption() {
        this.addShopRoutingRuleDialogService.addOption();
    }

    removeOption(idx: number) {
        this.addShopRoutingRuleDialogService.removeOption(idx);
    }
}
