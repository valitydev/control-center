import { NgModule } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { SelectFieldModule } from '@vality/matez';

import { ShopFieldComponent } from './shop-field.component';

@NgModule({
    declarations: [ShopFieldComponent],
    imports: [FormField, SelectFieldModule],
    exports: [ShopFieldComponent],
})
export class ShopFieldModule {}
