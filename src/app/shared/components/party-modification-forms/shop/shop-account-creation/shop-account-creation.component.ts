import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ShopAccountParams } from '@vality/domain-proto/payment_processing';

@Component({
    selector: 'cc-shop-account-creation',
    templateUrl: 'shop-account-creation.component.html',
})
export class ShopAccountCreationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ShopAccountParams;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const currency = this.initialValue?.currency ?? {};
        this.form.registerControl('currency', this.fb.group(currency));
        this.form.updateValueAndValidity();
    }
}
