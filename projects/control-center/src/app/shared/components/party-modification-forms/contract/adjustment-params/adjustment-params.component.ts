import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';

@Component({
    selector: 'cc-contract-adjustment-params',
    templateUrl: 'adjustment-params.component.html',
})
export class AdjustmentParamsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractAdjustmentParams;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('template', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
