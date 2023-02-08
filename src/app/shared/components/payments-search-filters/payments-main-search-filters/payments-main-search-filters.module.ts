import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { MerchantFieldModule } from '../../merchant-field';
import { PaymentsMainSearchFiltersComponent } from './payments-main-search-filters.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatBadgeModule,
        MatDialogModule,
        MatDividerModule,
        FlexLayoutModule,
        MatSelectModule,
        MerchantFieldModule,
    ],
    declarations: [PaymentsMainSearchFiltersComponent],
    exports: [PaymentsMainSearchFiltersComponent],
})
export class PaymentsMainSearchFiltersModule {}
