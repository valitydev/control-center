import { Component, Inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Predicate, RiskScore } from '@vality/domain-proto/lib/domain';

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
export class AddShopPaymentRoutingRuleDialogComponent {
    form = this.addShopPaymentRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopPaymentRoutingRuleDialogService.newTerminalOptionsForm;
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    terminalType = TerminalType;
    riskScore = RiskScore;
    terminals$ = this.domainStoreService.getObjects('terminal');

    constructor(
        private addShopPaymentRoutingRuleDialogService: AddShopPaymentRoutingRuleDialogService,
        private dialogRef: MatDialogRef<AddShopPaymentRoutingRuleDialogComponent>,
        private domainStoreService: DomainStoreService,
        @Inject(MAT_DIALOG_DATA) public data: { partyID: string; refID: number },
        private fb: FormBuilder
    ) {}

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
