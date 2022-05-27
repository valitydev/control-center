import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Predicate, RiskScore } from '@vality/domain-proto/lib/domain';

import { BaseDialogSuperclass } from '@cc/components/base-dialog';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';
import {
    AddShopPaymentRoutingRuleDialogService,
    TerminalType,
} from './add-shop-payment-routing-rule-dialog.service';

@UntilDestroy()
@Component({
    selector: 'cc-add-shop-payment-routing-rule-dialog',
    templateUrl: 'add-shop-payment-routing-rule-dialog.component.html',
    styleUrls: ['add-shop-payment-routing-rule-dialog.component.scss'],
    providers: [AddShopPaymentRoutingRuleDialogService],
})
export class AddShopPaymentRoutingRuleDialogComponent extends BaseDialogSuperclass<AddShopPaymentRoutingRuleDialogComponent> {
    form = this.addShopPaymentRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopPaymentRoutingRuleDialogService.newTerminalOptionsForm;
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    terminalType = TerminalType;
    riskScore = RiskScore;
    terminals$ = this.domainStoreService.getObjects('terminal');

    constructor(
        injector: Injector,
        private addShopPaymentRoutingRuleDialogService: AddShopPaymentRoutingRuleDialogService,
        private domainStoreService: DomainStoreService,
        private fb: FormBuilder
    ) {
        super(injector);
    }

    add() {
        this.addShopPaymentRoutingRuleDialogService.add(this.predicateControl.value);
    }

    cancel() {
        this.dialogRef.close();
    }

    addOption() {
        this.addShopPaymentRoutingRuleDialogService.addOption();
    }

    removeOption(idx: number) {
        this.addShopPaymentRoutingRuleDialogService.removeOption(idx);
    }
}
