import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
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
