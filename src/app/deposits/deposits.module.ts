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
    AutocompleteFieldModule,
    DateRangeFieldModule,
    FiltersModule,
    InputFieldModule,
    SelectFieldModule,
    TableModule,
} from '@vality/matez';

import { CurrencyFieldComponent } from '~/components/currency-field';
import { MerchantFieldModule } from '~/components/merchant-field';
import { PageLayoutModule } from '~/components/page-layout';
import { WalletFieldModule } from '~/components/wallet-field';

import { CreateDepositDialogModule } from './components/create-deposit-dialog/create-deposit-dialog.module';
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
        SelectFieldModule,
        CurrencyFieldComponent,
        WalletFieldModule,
    ],
    declarations: [DepositsComponent],
})
export class DepositsModule {}
