import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailsItemModule } from '@cc/components/details-item';

import { PaymentContractorComponent } from './payment-contractor.component';

@NgModule({
    declarations: [PaymentContractorComponent],
    imports: [DetailsItemModule, CommonModule],
    exports: [PaymentContractorComponent],
})
export class PaymentContractorModule {}
