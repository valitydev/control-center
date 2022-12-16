import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PayoutToolModificationUnit } from '@vality/domain-proto/payment_processing';
import get from 'lodash-es/get';
import * as uuid from 'uuid/v4';

@Component({
    selector: 'cc-contract-payout-tool-modification-unit',
    templateUrl: 'payout-tool-modification-unit.component.html',
})
export class PayoutToolModificationUnitComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: PayoutToolModificationUnit;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const payoutToolId = get(this, 'initialValue.payout_tool_id', '');
        this.form.registerControl(
            'payout_tool_id',
            this.fb.control(payoutToolId, Validators.required)
        );
        this.form.registerControl('modification', this.fb.group({}));
        this.form.updateValueAndValidity();
    }

    generate() {
        this.form.patchValue({ payout_tool_id: uuid() });
    }
}
