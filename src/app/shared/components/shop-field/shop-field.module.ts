import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ShopFieldComponent } from './shop-field.component';

@NgModule({
    declarations: [ShopFieldComponent],
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
    exports: [ShopFieldComponent],
})
export class ShopFieldModule {}
