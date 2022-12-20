import { Component, Input, OnChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ShopLocation } from '@vality/domain-proto/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-location',
    templateUrl: 'shop-location.component.html',
})
export class ShopLocationComponent implements OnChanges {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ShopLocation;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnChanges() {
        const url = get(this.initialValue, 'url', '');
        this.form.registerControl('url', this.fb.control(url));
        this.form.updateValueAndValidity();
    }
}
