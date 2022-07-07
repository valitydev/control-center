import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'cc-wallet-info',
    templateUrl: 'wallet-info.component.html',
})
export class WalletInfoComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        this.form.registerControl('wallet_id', this.fb.control(''));
        this.form.updateValueAndValidity();
    }
}
