import { NgModule } from '@angular/core';

import { DetailsItemModule } from '../../../../components/details-item/details-item.module';

import { ShopDetailsComponent } from './shop-details.component';

@NgModule({
    declarations: [ShopDetailsComponent],
    imports: [DetailsItemModule],
    exports: [ShopDetailsComponent],
})
export class ShopDetailsModule {}
