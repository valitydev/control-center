import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectFieldModule } from '@vality/ng-core';

import { SelectSearchFieldModule } from '@cc/components/select-search-field';

import { MerchantFieldComponent } from './merchant-field.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, SelectSearchFieldModule, SelectFieldModule],
    declarations: [MerchantFieldComponent],
    exports: [MerchantFieldComponent],
})
export class MerchantFieldModule {}
