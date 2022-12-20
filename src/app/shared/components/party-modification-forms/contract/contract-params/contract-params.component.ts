import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractParams } from '@vality/domain-proto/payment_processing';

@Component({
    selector: 'cc-contract-params',
    templateUrl: 'contract-params.component.html',
})
export class ContractParamsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractParams;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit(): void {
        this.form.registerControl('payment_institution', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
