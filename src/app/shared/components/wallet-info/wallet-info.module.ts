import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WalletInfoComponent } from './wallet-info.component';

const DECLARATIONS = [WalletInfoComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule],
})
export class WalletInfoModule {}
