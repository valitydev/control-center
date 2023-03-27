import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { BaseDialogModule } from '@vality/ng-core';

import { UserInfoBasedIdGeneratorModule } from '@cc/app/shared/services/user-info-based-id-generator/user-info-based-id-generator.module';

import { CreateDepositDialogComponent } from './create-deposit-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FlexModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressBarModule,
        UserInfoBasedIdGeneratorModule,
        BaseDialogModule,
    ],
    declarations: [CreateDepositDialogComponent],
})
export class CreateDepositDialogModule {}
