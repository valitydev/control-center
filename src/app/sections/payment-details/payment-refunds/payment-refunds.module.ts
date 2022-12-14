import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';
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
        EmptySearchResultModule,
        MatButtonModule,
        TableModule,
    ],
    exports: [PaymentRefundsComponent],
})
export class PaymentRefundsModule {}
