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

import { SourceCashFieldComponent } from '../../../../../components/source-cash-field';
import { CurrencySourceFieldComponent } from '../../../../shared/components/currency-source-field';
import { FistfulThriftFormComponent } from '../../../../shared/components/fistful-thrift-form';
import { UserInfoBasedIdGeneratorModule } from '../../../../shared/services/user-info-based-id-generator/user-info-based-id-generator.module';

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
