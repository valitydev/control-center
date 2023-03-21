import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { BaseDialogModule } from '@vality/ng-core';

import { ConfirmActionDialogComponent } from './confirm-action-dialog.component';

@NgModule({
    imports: [
        MatDialogModule,
        MatButtonModule,
        FlexLayoutModule,
        BaseDialogModule,
        MatFormFieldModule,
        CommonModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    declarations: [ConfirmActionDialogComponent],
    exports: [ConfirmActionDialogComponent],
})
export class ConfirmActionDialogModule {}
