import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Predicate, RiskScore } from '@vality/domain-proto/lib/domain';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';
import {
    AddShopPaymentRoutingRuleDialogService,
    TerminalType,
} from './add-shop-payment-routing-rule-dialog.service';

@Component({
    selector: 'cc-add-shop-payment-routing-rule-dialog',
    templateUrl: 'add-shop-payment-routing-rule-dialog.component.html',
    styleUrls: ['add-shop-payment-routing-rule-dialog.component.scss'],
    providers: [AddShopPaymentRoutingRuleDialogService],
})
export class AddShopPaymentRoutingRuleDialogComponent {
    form = this.addShopPaymentRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopPaymentRoutingRuleDialogService.newTerminalOptionsForm;

    terminalType = TerminalType;
    riskScore = RiskScore;
    terminals$ = this.domainStoreService.getObjects('terminal');

    predicate: Predicate;
    predicateValid: boolean;

    constructor(
        private addShopPaymentRoutingRuleDialogService: AddShopPaymentRoutingRuleDialogService,
        private dialogRef: MatDialogRef<AddShopPaymentRoutingRuleDialogComponent>,
        private domainStoreService: DomainStoreService,
        @Inject(MAT_DIALOG_DATA) public data: { partyID: string; refID: number }
    ) {}

    add() {
        this.addShopPaymentRoutingRuleDialogService.add(this.predicate);
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
