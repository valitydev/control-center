import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

import { DetailsItemModule } from '@cc/components/details-item';

import { ShopDetailsComponent } from './shop-details.component';

@NgModule({
    declarations: [ShopDetailsComponent],
    imports: [FlexModule, DetailsItemModule],
    exports: [ShopDetailsComponent],
})
export class ShopDetailsModule {}
