import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SelectFieldModule } from '@vality/matez';

import { WalletFieldComponent } from './wallet-field.component';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, SelectFieldModule],
    declarations: [WalletFieldComponent],
    exports: [WalletFieldComponent],
})
export class WalletFieldModule {}
