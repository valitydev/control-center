import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ContractAdjustmentModificationUnit } from '@vality/domain-proto/payment_processing';
import get from 'lodash-es/get';
import * as uuid from 'uuid/v4';

@Component({
    selector: 'cc-adjustment-modification-unit',
    templateUrl: 'adjustment-modification-unit.component.html',
})
export class AdjustmentModificationUnitComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractAdjustmentModificationUnit;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const adjustmentId = get(this, 'initialValue.adjustment_id', '');
        this.form.registerControl(
            'adjustment_id',
            this.fb.control(adjustmentId, Validators.required)
        );
        this.form.registerControl('modification', this.fb.group({}));
        this.form.updateValueAndValidity();
    }

    generate() {
        this.form.patchValue({ adjustment_id: uuid() });
    }
}
