import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DetailsItemModule } from '@cc/components/details-item';

import { PaymentErrorComponent } from './payment-error.component';

@NgModule({
    declarations: [PaymentErrorComponent],
    imports: [DetailsItemModule, CommonModule, MatProgressSpinnerModule],
    exports: [PaymentErrorComponent],
})
export class PaymentErrorModule {}
