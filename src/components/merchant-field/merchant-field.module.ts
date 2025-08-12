import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SelectFieldModule } from '@vality/matez';

import { MerchantFieldComponent } from './merchant-field.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, SelectFieldModule],
    declarations: [MerchantFieldComponent],
    exports: [MerchantFieldComponent],
})
export class MerchantFieldModule {}
