import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { BankCardModule } from './bank-card';
import { PaymentToolComponent } from './payment-tool.component';
@NgModule({
    imports: [CommonModule, FlexLayoutModule, BankCardModule],
    declarations: [PaymentToolComponent],
    exports: [PaymentToolComponent],
})
export class PaymentToolModule {}
