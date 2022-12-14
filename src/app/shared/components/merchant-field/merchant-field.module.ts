import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { SelectSearchFieldModule } from '@cc/components/select-search-field';

import { MerchantFieldComponent } from './merchant-field.component';

@NgModule({
    imports: [
        MatFormFieldModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        CommonModule,
        SelectSearchFieldModule,
    ],
    declarations: [MerchantFieldComponent],
    exports: [MerchantFieldComponent],
    providers: [],
})
export class MerchantFieldModule {}
