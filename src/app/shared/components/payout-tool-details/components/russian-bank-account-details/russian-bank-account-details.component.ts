import { Component, Input } from '@angular/core';

import { RussianBankAccount } from '@cc/app/api/damsel/gen-model/domain';

@Component({
    selector: 'cc-russian-bank-account-details',
    templateUrl: './russian-bank-account-details.component.html',
})
export class RussianBankAccountDetailsComponent {
    @Input() russianBankAccount: RussianBankAccount;
}
