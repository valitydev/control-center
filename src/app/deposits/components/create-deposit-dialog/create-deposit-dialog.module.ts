import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { DialogModule } from '@vality/matez';

import { CurrencySourceFieldComponent } from '~/components/currency-source-field';
import { FistfulThriftFormComponent } from '~/components/fistful-thrift-form';
import { SourceCashFieldComponent } from '~/components/source-cash-field';
import { UserInfoBasedIdGeneratorModule } from '~/services';

import { CreateDepositDialogComponent } from './create-deposit-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressBarModule,
        UserInfoBasedIdGeneratorModule,
        DialogModule,
        CurrencySourceFieldComponent,
        FistfulThriftFormComponent,
        SourceCashFieldComponent,
    ],
    declarations: [CreateDepositDialogComponent],
})
export class CreateDepositDialogModule {}
