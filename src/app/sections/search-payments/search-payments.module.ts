import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PaymentsSearcherModule } from '../../shared/components/payments-searcher';
import { SearchPaymentsRoutingModule } from './search-payments-routing.module';
import { SearchPaymentsComponent } from './search-payments.component';

@NgModule({
    imports: [
        SearchPaymentsRoutingModule,
        MatCardModule,
        FlexModule,
        MatProgressBarModule,
        CommonModule,
        EmptySearchResultModule,
        MatButtonModule,
        PaymentsSearcherModule,
    ],
    declarations: [SearchPaymentsComponent],
})
export class SearchPaymentsModule {}
