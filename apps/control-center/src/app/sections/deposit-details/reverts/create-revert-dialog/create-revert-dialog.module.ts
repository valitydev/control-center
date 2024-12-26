import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DialogModule } from '@vality/matez';


import { CashFieldComponent } from '../../../../../components/cash-field';
import { FistfulThriftFormComponent } from '../../../../shared/components/fistful-thrift-form';
import { UserInfoBasedIdGeneratorModule } from '../../../../shared/services/user-info-based-id-generator/user-info-based-id-generator.module';

import { CreateRevertDialogComponent } from './create-revert-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatButtonModule,
        MatInputModule,
        UserInfoBasedIdGeneratorModule,
        DialogModule,
        FistfulThriftFormComponent,
        CashFieldComponent,
    ],
    declarations: [CreateRevertDialogComponent],
})
export class CreateRevertDialogModule {}
