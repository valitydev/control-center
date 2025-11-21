import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { DialogModule } from '@vality/matez';

import { TargetRulesetFormModule } from '../target-ruleset-form';

import { ChangeTargetDialogComponent } from './change-target-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        TargetRulesetFormModule,
        MatDialogModule,
        MatButtonModule,
        DialogModule,
    ],
    declarations: [ChangeTargetDialogComponent],
    exports: [ChangeTargetDialogComponent],
})
export class ChangeTargetDialogModule {}
