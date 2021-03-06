import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RussianLegalEntity } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-russian-legal-entity',
    templateUrl: 'russian-legal-entity.component.html',
})
export class RussianLegalEntityComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: RussianLegalEntity;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const control = (value) => this.fb.control(value, Validators.required);
        const registeredName = get(this, 'initialValue.registered_name', '');
        const registeredNumber = get(this, 'initialValue.registered_number', '');
        const inn = get(this, 'initialValue.inn', '');
        const actualAddress = get(this, 'initialValue.actual_address', '');
        const postAddress = get(this, 'initialValue.post_address', '');
        const representativePosition = get(this, 'initialValue.representative_position', '');
        const representativeFullName = get(this, 'initialValue.representative_full_name', '');
        const representativeDocument = get(this, 'initialValue.representative_document', '');
        this.form.registerControl('registered_name', control(registeredName));
        this.form.registerControl('registered_number', control(registeredNumber));
        this.form.registerControl('inn', control(inn));
        this.form.registerControl('actual_address', control(actualAddress));
        this.form.registerControl('post_address', control(postAddress));
        this.form.registerControl('representative_position', control(representativePosition));
        this.form.registerControl('representative_full_name', control(representativeFullName));
        this.form.registerControl('representative_document', control(representativeDocument));
        this.form.registerControl('russian_bank_account', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
