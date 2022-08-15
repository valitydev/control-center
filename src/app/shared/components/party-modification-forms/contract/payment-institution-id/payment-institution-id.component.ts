import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractorID } from '@vality/domain-proto';

@Component({
    selector: 'cc-payment-institution-id',
    templateUrl: 'payment-institution-id.component.html',
})
export class PaymentInstitutionIdComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractorID;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit(): void {
        this.form.registerControl('payment_institution', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
