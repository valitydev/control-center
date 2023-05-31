import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PageLayoutModule } from '../../shared';
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
        PageLayoutModule,
    ],
    declarations: [SearchPaymentsComponent],
})
export class SearchPaymentsModule {}
