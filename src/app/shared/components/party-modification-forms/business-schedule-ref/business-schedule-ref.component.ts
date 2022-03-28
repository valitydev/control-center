import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessScheduleRef } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-business-schedule-ref',
    templateUrl: 'business-schedule-ref.component.html',
})
export class BusinessScheduleRefComponent implements OnInit {
    @Input()
    form: FormGroup;

    @Input()
    initialValue: BusinessScheduleRef;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        const id = get(this, 'initialValue.id', '');
        this.form.registerControl('id', this.fb.control(id, Validators.required));
        this.form.updateValueAndValidity();
    }

    scheduleIdChange(id: number) {
        this.form.controls.id.setValue(id);
    }
}
