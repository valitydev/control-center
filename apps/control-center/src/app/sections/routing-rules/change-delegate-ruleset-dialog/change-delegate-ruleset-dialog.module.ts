import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogModule } from '@vality/matez';

import { ChangeDelegateRulesetDialogComponent } from './change-delegate-ruleset-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        DialogModule,
    ],
    declarations: [ChangeDelegateRulesetDialogComponent],
    exports: [ChangeDelegateRulesetDialogComponent],
    providers: [],
})
export class ChangeDelegateRulesetDialogModule {}
