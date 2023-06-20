import { NgModule } from '@angular/core';

import { ShopNamePipe } from './shop-name.pipe';

@NgModule({
    declarations: [ShopNamePipe],
    exports: [ShopNamePipe],
})
export class ShopNameModule {}
