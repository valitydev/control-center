import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { DialogModule, SelectFieldModule } from '@vality/matez';

import { AddPartyRoutingRuleDialogComponent } from './add-party-routing-rule-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatRadioModule,
        MatAutocompleteModule,
        DialogModule,
        SelectFieldModule,
    ],
    declarations: [AddPartyRoutingRuleDialogComponent],
    exports: [AddPartyRoutingRuleDialogComponent],
})
export class AddPartyRoutingRuleDialogModule {}
