import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ContractTermination } from '@vality/domain-proto/payment_processing';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-termination',
    templateUrl: 'termination.component.html',
})
export class TerminationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: ContractTermination;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const reason = get(this, 'initialValue.reason', '');
        this.form.registerControl('reason', this.fb.control(reason));
        this.form.updateValueAndValidity();
    }
}
