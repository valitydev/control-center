import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SelectFieldModule } from '@vality/ng-core';

import { ShopFieldComponent } from './shop-field.component';

@NgModule({
    declarations: [ShopFieldComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        SelectFieldModule,
    ],
    exports: [ShopFieldComponent],
})
export class ShopFieldModule {}
