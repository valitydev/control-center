import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { BaseDialogModule } from '@cc/components/base-dialog';

import { ConfirmActionDialogComponent } from './confirm-action-dialog.component';

@NgModule({
    imports: [MatDialogModule, MatButtonModule, FlexLayoutModule, BaseDialogModule],
    declarations: [ConfirmActionDialogComponent],
    exports: [ConfirmActionDialogComponent],
})
export class ConfirmActionDialogModule {}
