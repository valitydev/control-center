import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

import { PartiesSearchFiltersComponent } from './parties-search-filters.component';

@NgModule({
    imports: [FlexModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    exports: [PartiesSearchFiltersComponent],
    declarations: [PartiesSearchFiltersComponent],
})
export class PartiesSearchFiltersModule {}
