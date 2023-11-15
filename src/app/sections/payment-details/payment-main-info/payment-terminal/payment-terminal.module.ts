import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DetailsItemModule } from '@cc/components/details-item';

import { PaymentTerminalComponent } from './payment-terminal.component';

@NgModule({
    declarations: [PaymentTerminalComponent],
    imports: [DetailsItemModule, CommonModule],
    exports: [PaymentTerminalComponent],
})
export class PaymentTerminalModule {}
