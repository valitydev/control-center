import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Contractor } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-contractor',
    templateUrl: 'contractor.component.html',
})
export class ContractorComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: Contractor;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('legal_entity', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
