import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RussianBankAccount } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

@Component({
    selector: 'cc-russian-bank-account',
    templateUrl: 'russian-bank-account.component.html',
})
export class RussianBankAccountComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: RussianBankAccount;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const control = (value) => this.fb.control(value, Validators.required);
        const account = get(this, 'initialValue.account', '');
        const bankName = get(this, 'initialValue.bank_name', '');
        const bankPostAccount = get(this, 'initialValue.bank_post_account', '');
        const bankBik = get(this, 'initialValue.bank_bik', '');
        this.form.registerControl('account', control(account));
        this.form.registerControl('bank_name', control(bankName));
        this.form.registerControl('bank_post_account', control(bankPostAccount));
        this.form.registerControl('bank_bik', control(bankBik));
        this.form.updateValueAndValidity();
    }
}
