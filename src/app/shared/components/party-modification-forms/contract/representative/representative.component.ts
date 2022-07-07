import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Representative } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-representative',
    templateUrl: 'representative.component.html',
})
export class RepresentativeComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: Representative;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const position = get(this, 'initialValue.position', '');
        const fullName = get(this, 'initialValue.full_name', '');
        this.form.registerControl('position', this.fb.control(position, Validators.required));
        this.form.registerControl('full_name', this.fb.control(fullName, Validators.required));
        this.form.registerControl('document', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
