import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ThriftPipesModule } from '@cc/app/shared/pipes';
import { DetailsItemModule } from '@cc/components/details-item';

import { InternationalBankAccountDetailsComponent } from './components/international-bank-account-details/international-bank-account-details.component';
import { RussianBankAccountDetailsComponent } from './components/russian-bank-account-details/russian-bank-account-details.component';
import { PayoutToolDetailsComponent } from './payout-tool-details.component';

@NgModule({
    declarations: [
        PayoutToolDetailsComponent,
        RussianBankAccountDetailsComponent,
        InternationalBankAccountDetailsComponent,
    ],
    imports: [CommonModule, DetailsItemModule, ThriftPipesModule],
    exports: [PayoutToolDetailsComponent],
})
export class PayoutToolDetailsModule {}
