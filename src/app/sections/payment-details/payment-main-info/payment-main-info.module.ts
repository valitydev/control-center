import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ShopDetailsModule, StatusModule } from '@cc/app/shared/components';
import { CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
import { DetailsItemModule } from '@cc/components/details-item';

import { PaymentContractorModule } from './payment-contractor';
import { PaymentErrorModule } from './payment-error';
import { PaymentMainInfoComponent } from './payment-main-info.component';
import { PaymentProviderModule } from './payment-provider';
import { PaymentTerminalModule } from './payment-terminal';
import { PaymentToolModule } from './payment-tool';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        DetailsItemModule,
        StatusModule,
        PaymentToolModule,
        ThriftPipesModule,
        CommonPipesModule,
        MatDividerModule,
        PaymentContractorModule,
        PaymentTerminalModule,
        PaymentProviderModule,
        PaymentErrorModule,
        ShopDetailsModule,
    ],
    declarations: [PaymentMainInfoComponent],
    exports: [PaymentMainInfoComponent],
})
export class PaymentMainInfoModule {}
