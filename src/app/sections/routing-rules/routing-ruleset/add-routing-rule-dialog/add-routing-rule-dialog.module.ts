import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { MetadataFormModule } from '@cc/app/shared';
import { BaseDialogModule } from '@cc/components/base-dialog';

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
