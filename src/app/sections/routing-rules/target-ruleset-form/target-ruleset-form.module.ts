import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatSelectModule } from '@angular/material/select';

import { DetailsItemModule } from '../../../../components/details-item';
import { TargetRulesetFormComponent } from './target-ruleset-form.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatFormFieldModule,
        MatSelectModule,
        DetailsItemModule,
        MatDividerModule,
        MatInputModule,
        MatButtonModule,
    ],
    declarations: [TargetRulesetFormComponent],
    exports: [TargetRulesetFormComponent],
})
export class TargetRulesetFormModule {}
