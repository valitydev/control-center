import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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
