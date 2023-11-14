import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TableModule } from '@cc/components/table';

import { FetchRefundsService } from './fetch-refunds.service';
import { PaymentRefundsComponent } from './payment-refunds.component';
import { RefundsTableModule } from './refunds-table';

@NgModule({
    declarations: [PaymentRefundsComponent],
    providers: [FetchRefundsService],
    imports: [
        CommonModule,
        RefundsTableModule,
        FlexModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        TableModule,
    ],
    exports: [PaymentRefundsComponent],
})
export class PaymentRefundsModule {}
