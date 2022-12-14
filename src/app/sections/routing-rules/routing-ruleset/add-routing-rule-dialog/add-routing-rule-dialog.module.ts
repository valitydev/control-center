import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { BaseDialogModule } from '@vality/ng-core';

import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';

import { AddRoutingRuleDialogComponent } from './add-routing-rule-dialog.component';
import { ExpanderComponent } from './expander';
import { PredicateComponent } from './predicate';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        FlexLayoutModule,
        MatDialogModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatRadioModule,
        MatAutocompleteModule,
        MetadataFormModule,
        BaseDialogModule,
    ],
    declarations: [AddRoutingRuleDialogComponent, PredicateComponent, ExpanderComponent],
    exports: [AddRoutingRuleDialogComponent],
})
export class AddRoutingRuleDialogModule {}
