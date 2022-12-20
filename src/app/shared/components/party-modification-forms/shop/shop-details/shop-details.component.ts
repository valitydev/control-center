import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ShopDetails } from '@vality/domain-proto/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-details',
    templateUrl: 'shop-details.component.html',
})
export class ShopDetailsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ShopDetails;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const name = get(this.initialValue, 'name', '');
        const description = get(this.initialValue, 'description', '');
        this.form.registerControl('name', this.fb.control(name, Validators.required));
        this.form.registerControl('description', this.fb.control(description));
        this.form.updateValueAndValidity();
    }
}
