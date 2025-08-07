import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DialogModule } from '../dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@NgModule({
    imports: [
        MatDialogModule,
        MatButtonModule,
        DialogModule,
        MatFormFieldModule,
        CommonModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    declarations: [ConfirmDialogComponent],
    exports: [ConfirmDialogComponent],
})
export class ConfirmDialogModule {}
