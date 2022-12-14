import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { ActionsModule, BaseDialogModule } from '@vality/ng-core';

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
        BaseDialogModule,
        MetadataFormModule,
    ],
    declarations: [PaymentsSearcherComponent, CreatePaymentAdjustmentComponent],
    exports: [PaymentsSearcherComponent],
})
export class PaymentsSearcherModule {}
