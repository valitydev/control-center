import { NgModule } from '@angular/core';

import { DetailsItemModule } from '@cc/components/details-item';

import { ShopDetailsComponent } from './shop-details.component';

@NgModule({
    declarations: [ShopDetailsComponent],
    imports: [DetailsItemModule],
    exports: [ShopDetailsComponent],
})
export class ShopDetailsModule {}
