import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActionsModule } from '@cc/components/actions';

import { BaseDialogComponent } from './base-dialog.component';
import { BaseDialogActionsDirective } from './directives/base-dialog-actions/base-dialog-actions.directive';

const SHARED_DECLARATIONS = [BaseDialogComponent, BaseDialogActionsDirective];

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatDividerModule,
        MatButtonModule,
        ActionsModule,
        ActionsModule,
        MatIconModule,
        MatProgressBarModule,
        MatDialogModule,
    ],
    declarations: SHARED_DECLARATIONS,
    exports: SHARED_DECLARATIONS,
})
export class BaseDialogModule {}
