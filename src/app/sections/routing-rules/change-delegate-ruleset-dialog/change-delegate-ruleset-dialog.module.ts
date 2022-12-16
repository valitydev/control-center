import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { BaseDialogModule } from '@vality/ng-core';

import { ChangeDelegateRulesetDialogComponent } from './change-delegate-ruleset-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        BaseDialogModule,
    ],
    declarations: [ChangeDelegateRulesetDialogComponent],
    exports: [ChangeDelegateRulesetDialogComponent],
    providers: [],
})
export class ChangeDelegateRulesetDialogModule {}
