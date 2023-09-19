import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectFieldModule } from '@vality/ng-core';

import { PayoutToolFieldComponent } from './payout-tool-field.component';

@NgModule({
    imports: [
        MatFormFieldModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        CommonModule,
        SelectFieldModule,
    ],
    declarations: [PayoutToolFieldComponent],
    exports: [PayoutToolFieldComponent],
})
export class PayoutToolFieldModule {}
