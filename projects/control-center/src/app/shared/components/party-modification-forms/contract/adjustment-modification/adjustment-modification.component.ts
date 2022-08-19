import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractAdjustmentModification } from '@vality/domain-proto/lib/payment_processing';

@Component({
    selector: 'cc-adjustment-modification',
    templateUrl: 'adjustment-modification.component.html',
})
export class AdjustmentModificationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractAdjustmentModification;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('creation', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
