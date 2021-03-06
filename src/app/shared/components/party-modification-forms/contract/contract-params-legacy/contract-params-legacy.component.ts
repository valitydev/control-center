import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractParams } from '@vality/domain-proto/lib/payment_processing';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-contract-params-legacy',
    templateUrl: 'contract-params-legacy.component.html',
})
export class ContractParamsLegacyComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractParams;

    showTemplate = false;

    showPaymentInstitution = false;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('contractor', this.fb.group({}));
        this.toggleTemplate();
        this.togglePaymentInstitution();
        this.form.updateValueAndValidity();
    }

    toggleCheckbox(show: boolean, controlName: string, data: any = {}) {
        if (show) {
            this.form.registerControl(controlName, this.fb.group(data || {}));
        } else {
            this.form.removeControl(controlName);
        }
    }

    toggleTemplate() {
        const template = get(this, 'initialValue.template', null);
        this.showTemplate = template !== null;
        this.toggleCheckbox(this.showTemplate, 'template', template);
    }

    togglePaymentInstitution() {
        const paymentInstitution = get(this, 'initialValue.payment_institution', null);
        this.showPaymentInstitution = paymentInstitution !== null;
        this.toggleCheckbox(this.showPaymentInstitution, 'payment_institution', paymentInstitution);
    }
}
