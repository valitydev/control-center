import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { InternationalLegalEntity } from '@vality/domain-proto/lib/domain';

@Component({
    selector: 'cc-international-legal-entity',
    templateUrl: 'international-legal-entity.component.html',
})
export class InternationalLegalEntityComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: InternationalLegalEntity;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit(): void {
        this.form.registerControl('legal_name', this.fb.control(null, Validators.required));
        this.form.registerControl('registered_address', this.fb.control(null, Validators.required));
        this.form.registerControl(
            'country',
            this.fb.control('', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)])
        );

        this.form.registerControl('trading_name', this.fb.control(null));
        this.form.registerControl('actual_address', this.fb.control(null));
        this.form.registerControl('registered_number', this.fb.control(null));

        if (this.initialValue) {
            this.form.patchValue(this.initialValue);
        }

        this.form.updateValueAndValidity();
    }
}
