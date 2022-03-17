import { Component, Input } from '@angular/core';

import { InternationalBankAccount } from '@cc/app/api/damsel/gen-model/domain';

@Component({
    selector: 'cc-international-bank-account-details',
    templateUrl: './international-bank-account-details.component.html',
})
export class InternationalBankAccountDetailsComponent {
    @Input() internationalBankAccount: InternationalBankAccount;
}
