import { NgModule } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { SelectFieldModule } from '@vality/matez';

import { WalletFieldComponent } from './wallet-field.component';

@NgModule({
    imports: [FormField, SelectFieldModule],
    declarations: [WalletFieldComponent],
    exports: [WalletFieldComponent],
})
export class WalletFieldModule {}
