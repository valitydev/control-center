import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { DetailsItemModule } from '@cc/components/details-item';

import { PaymentErrorComponent } from './payment-error.component';

@NgModule({
    declarations: [PaymentErrorComponent],
    imports: [FlexModule, DetailsItemModule, CommonModule, MatProgressSpinnerModule],
    exports: [PaymentErrorComponent],
})
export class PaymentErrorModule {}
