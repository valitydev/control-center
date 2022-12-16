import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { ShopFieldComponent } from './shop-field.component';

@NgModule({
    declarations: [ShopFieldComponent],
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
    exports: [ShopFieldComponent],
})
export class ShopFieldModule {}
