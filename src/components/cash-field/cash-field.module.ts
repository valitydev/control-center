import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { InputMaskModule } from '@ngneat/input-mask';

import { CashFieldComponent } from './cash-field.component';

@NgModule({
    declarations: [CashFieldComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        FlexModule,
        MatAutocompleteModule,
        InputMaskModule,
        ReactiveFormsModule,
    ],
    exports: [CashFieldComponent],
})
export class CashModule {}
