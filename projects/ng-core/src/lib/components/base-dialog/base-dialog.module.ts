import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActionsModule } from '../actions';
import { BaseDialogComponent } from './base-dialog.component';
import { BaseDialogActionsComponent } from './components/base-dialog-actions/base-dialog-actions.component';

const SHARED_DECLARATIONS = [BaseDialogComponent, BaseDialogActionsComponent];

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatDividerModule,
        MatButtonModule,
        ActionsModule,
        MatIconModule,
        MatProgressBarModule,
        MatDialogModule,
    ],
    declarations: SHARED_DECLARATIONS,
    exports: SHARED_DECLARATIONS,
})
export class BaseDialogModule {}
