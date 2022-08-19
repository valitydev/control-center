import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { InternationalBankDetails } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-international-bank-details',
    templateUrl: 'international-bank-details.component.html',
})
export class InternationalBankDetailsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: InternationalBankDetails;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const control = (data = '') => this.fb.control(data);
        const bic = get(this, 'initialValue.bic', '');
        const country = get(this, 'initialValue.country', '');
        const name = get(this, 'initialValue.name', '');
        const address = get(this, 'initialValue.address', '');
        const abaRtn = get(this, 'initialValue.aba_rtn', '');
        this.form.registerControl('bic', control(bic));
        this.form.registerControl('country', control(country)); // Residence enum
        this.form.registerControl('name', control(name));
        this.form.registerControl('address', control(address));
        this.form.registerControl('aba_rtn', control(abaRtn));
        this.form.updateValueAndValidity();
    }
}
