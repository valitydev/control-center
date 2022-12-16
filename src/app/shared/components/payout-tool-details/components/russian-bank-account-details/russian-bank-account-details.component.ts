import { Component, Input } from '@angular/core';
import { RussianBankAccount } from '@vality/domain-proto/domain';

@Component({
    selector: 'cc-russian-bank-account-details',
    templateUrl: './russian-bank-account-details.component.html',
})
export class RussianBankAccountDetailsComponent {
    @Input() russianBankAccount: RussianBankAccount;
}
