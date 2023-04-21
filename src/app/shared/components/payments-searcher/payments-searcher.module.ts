import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActionsModule, DialogModule } from '@vality/ng-core';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { MetadataFormModule } from '../metadata-form';
import {
    PaymentsMainSearchFiltersModule,
    PaymentsOtherSearchFiltersModule,
} from '../payments-search-filters';
import { PaymentsTableModule } from '../payments-table';
import { StatusModule } from '../status';
import { CreatePaymentAdjustmentComponent } from './create-payment-adjustment/create-payment-adjustment.component';
import { PaymentsSearcherComponent } from './payments-searcher.component';

@NgModule({
    imports: [
        FlexModule,
        MatCardModule,
        MatProgressBarModule,
        CommonModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        PaymentsMainSearchFiltersModule,
        StatusModule,
        PaymentsTableModule,
        MatBadgeModule,
        PaymentsOtherSearchFiltersModule,
        EmptySearchResultModule,
        ActionsModule,
        DialogModule,
        MetadataFormModule,
    ],
    declarations: [PaymentsSearcherComponent, CreatePaymentAdjustmentComponent],
    exports: [PaymentsSearcherComponent],
})
export class PaymentsSearcherModule {}
