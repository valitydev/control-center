import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BankCardModule } from './bank-card';
import { PaymentToolComponent } from './payment-tool.component';
@NgModule({
    imports: [CommonModule, BankCardModule],
    declarations: [PaymentToolComponent],
    exports: [PaymentToolComponent],
})
export class PaymentToolModule {}
