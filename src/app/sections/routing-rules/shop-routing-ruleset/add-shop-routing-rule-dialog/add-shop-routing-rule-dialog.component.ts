import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Predicate, RiskScore } from '@vality/domain-proto/lib/domain';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';
import {
    AddShopRoutingRuleDialogService,
    TerminalType,
} from './add-shop-routing-rule-dialog.service';

@UntilDestroy()
@Component({
    selector: 'cc-add-shop-routing-rule-dialog',
    templateUrl: 'add-shop-routing-rule-dialog.component.html',
    styleUrls: ['add-shop-routing-rule-dialog.component.scss'],
    providers: [AddShopRoutingRuleDialogService],
})
export class AddShopRoutingRuleDialogComponent extends BaseDialogSuperclass<
    AddShopRoutingRuleDialogComponent,
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
        private addShopRoutingRuleDialogService: AddShopRoutingRuleDialogService,
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
