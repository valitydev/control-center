import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShopLocation } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-location',
    templateUrl: 'shop-location.component.html',
})
export class ShopLocationComponent implements OnChanges {
    @Input()
    form: FormGroup;

    @Input()
    initialValue: ShopLocation;

    constructor(private fb: FormBuilder) {}

    ngOnChanges() {
        const url = get(this.initialValue, 'url', '');
        this.form.registerControl('url', this.fb.control(url));
        this.form.updateValueAndValidity();
    }
}
