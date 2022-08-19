import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'cc-currency-ref',
    templateUrl: 'currency-ref.component.html',
})
export class CurrencyRefComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('symbolic_code', this.fb.control('RUB', Validators.required));
        this.form.updateValueAndValidity();
    }
}
