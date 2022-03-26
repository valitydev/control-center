import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractorID } from '@vality/domain-proto';

@Component({
    selector: 'cc-contractor-id',
    templateUrl: 'contractor-id.component.html',
})
export class ContractorIdComponent implements OnInit {
    @Input()
    form: FormGroup;

    @Input()
    initialValue: ContractorID;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.form.registerControl(
            'contractor_id',
            this.fb.control(this.initialValue || '', Validators.required)
        );
        this.form.updateValueAndValidity();
    }
}
