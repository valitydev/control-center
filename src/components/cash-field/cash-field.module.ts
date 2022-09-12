import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
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
    ],
    exports: [CashFieldComponent],
})
export class CashModule {}
