import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { TargetRulesetFormComponent } from './target-ruleset-form.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDividerModule,
        MatInputModule,
        MatButtonModule,
    ],
    declarations: [TargetRulesetFormComponent],
    exports: [TargetRulesetFormComponent],
})
export class TargetRulesetFormModule {}
