import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PayoutToolInfo } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-payout-tool-params',
    templateUrl: 'payout-tool-params.component.html',
})
export class PayoutToolParamsComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: PayoutToolInfo;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('currency', this.fb.group({}));
        this.form.registerControl('tool_info', this.fb.group({}));
        this.form.updateValueAndValidity();
    }
}
