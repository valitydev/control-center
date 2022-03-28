import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContractTermination } from '@vality/domain-proto/lib/payment_processing';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-termination',
    templateUrl: 'termination.component.html',
})
export class TerminationComponent implements OnInit {
    @Input()
    form: FormGroup;

    @Input()
    initialValue: ContractTermination;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        const reason = get(this, 'initialValue.reason', '');
        this.form.registerControl('reason', this.fb.control(reason));
        this.form.updateValueAndValidity();
    }
}
