import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
    TableModule,
    FiltersModule,
    DateRangeFieldModule,
    InputFieldModule,
    AutocompleteFieldModule,
} from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';
import { MerchantFieldModule } from '../../shared/components/merchant-field';

import { CreateDepositDialogModule } from './create-deposit-dialog/create-deposit-dialog.module';
import { DepositsRoutingModule } from './deposits-routing.module';
import { DepositsComponent } from './deposits.component';

@NgModule({
    imports: [
        DepositsRoutingModule,
        MatCardModule,
        CommonModule,
        MatButtonModule,
        CreateDepositDialogModule,
        MatProgressSpinnerModule,
        PageLayoutModule,
        TableModule,
        FiltersModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        MerchantFieldModule,
        ReactiveFormsModule,
        DateRangeFieldModule,
        InputFieldModule,
        AutocompleteFieldModule,
    ],
    declarations: [DepositsComponent],
})
export class DepositsModule {}
