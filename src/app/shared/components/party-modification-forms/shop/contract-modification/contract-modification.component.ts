import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ShopContractModification } from '@vality/domain-proto/payment_processing';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-contract-modification',
    templateUrl: 'contract-modification.component.html',
})
export class ContractModificationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ShopContractModification;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const contractId = get(this, 'initialValue.contract_id', '');
        const payoutToolId = get(this, 'initialValue.payout_tool_id', '');
        this.form.registerControl('contract_id', this.fb.control(contractId, Validators.required));
        this.form.registerControl(
            'payout_tool_id',
            this.fb.control(payoutToolId, Validators.required)
        );
        this.form.updateValueAndValidity();
    }
}
