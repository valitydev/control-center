import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActionsModule } from '../actions';
import { ProgressModule } from '../progress/progress.module';

import { DialogActionsComponent } from './components/dialog-actions/dialog-actions.component';
import { DialogComponent } from './dialog.component';
import { DialogService } from './services/dialog.service';

@NgModule({
    imports: [
        CommonModule,
        MatDividerModule,
        MatButtonModule,
        ActionsModule,
        MatIconModule,
        MatProgressBarModule,
        MatDialogModule,
        ProgressModule,
    ],
    providers: [DialogService],
    declarations: [DialogComponent, DialogActionsComponent],
    exports: [DialogComponent, DialogActionsComponent],
})
export class DialogModule {}
