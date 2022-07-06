import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PayoutToolID } from '@vality/domain-proto';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-payout-tool-modification',
    templateUrl: 'payout-tool-modification.component.html',
})
export class PayoutToolModificationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: PayoutToolID;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const payoutToolId = get(this, 'initialValue.modification', '');
        this.form.setControl('modification', this.fb.control(payoutToolId, Validators.required));
        this.form.updateValueAndValidity();
    }
}
