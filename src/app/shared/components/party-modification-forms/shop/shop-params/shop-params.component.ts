import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ShopParams } from '@vality/domain-proto/lib/payment_processing';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-shop-params',
    templateUrl: 'shop-params.component.html',
})
export class ShopParamsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ShopParams;

    showCategory = false;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const contractId = get(this, 'initialValue.contract_id', '');
        const payoutToolId = get(this, 'initialValue.payout_tool_id', '');
        this.form.registerControl('contract_id', this.fb.control(contractId, Validators.required));
        this.form.registerControl(
            'payout_tool_id',
            this.fb.control(payoutToolId, Validators.required)
        );
        this.form.registerControl('details', this.fb.group({}));
        this.form.registerControl('location', this.fb.group({}));
        this.toggleCategory();
        this.form.updateValueAndValidity();
    }

    toggleCheckbox(show: boolean, controlName: string, data: any = {}) {
        if (show) {
            this.form.registerControl(controlName, this.fb.group(data));
        } else {
            this.form.removeControl(controlName);
        }
    }

    toggleCategory() {
        const category = get(this, 'initialValue.category', null);
        this.showCategory = category !== null;
        this.toggleCheckbox(this.showCategory, 'category', category);
    }
}
