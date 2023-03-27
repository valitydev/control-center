import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BaseDialogModule } from '@vality/ng-core';

import { TargetRulesetFormModule } from '../target-ruleset-form';
import { ChangeTargetDialogComponent } from './change-target-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        TargetRulesetFormModule,
        FlexLayoutModule,
        MatDialogModule,
        MatButtonModule,
        BaseDialogModule,
    ],
    declarations: [ChangeTargetDialogComponent],
    exports: [ChangeTargetDialogComponent],
})
export class ChangeTargetDialogModule {}
