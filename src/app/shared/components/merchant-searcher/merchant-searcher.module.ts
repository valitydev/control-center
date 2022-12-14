import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { MerchantSearcherComponent } from './merchant-searcher.component';

@NgModule({
    declarations: [MerchantSearcherComponent],
    imports: [CommonModule, FlexModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule],
    exports: [MerchantSearcherComponent],
})
export class MerchantSearcherModule {}
