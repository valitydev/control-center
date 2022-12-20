import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LegalAgreement } from '@vality/domain-proto/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-legal-agreement-binding',
    templateUrl: 'legal-agreement-binding.component.html',
})
export class LegalAgreementBindingComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: LegalAgreement;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const legalAgreementId = get(this, 'initialValue.legal_agreement_id', '');
        const signedAt = get(this, 'initialValue.signed_at', '');
        const validUntil = get(this, 'initialValue.valid_until', '');
        this.form.registerControl(
            'legal_agreement_id',
            this.fb.control(legalAgreementId, Validators.required)
        );
        this.form.registerControl('signed_at', this.fb.control(signedAt, Validators.required));
        this.form.registerControl('valid_until', this.fb.control(validUntil));
        this.form.updateValueAndValidity();
    }
}
